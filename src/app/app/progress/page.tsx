import { Types } from "mongoose";
import { LineChart as LineIcon } from "lucide-react";

import { requireClient } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/mongoose";
import { WorkoutSession } from "@/models/WorkoutSession";
import { Workout } from "@/models/Workout";
import type { SerializedSession } from "@/lib/schemas/progress";
import ClientProgressView from "@/components/client-portal/ClientProgressView";

export const metadata = { title: "Progress · FlexFlow" };

export default async function ClientProgressPage() {
  const { client } = await requireClient();
  await connectDB();

  const docs = await WorkoutSession.find({ client: client._id })
    .populate<{ workout?: { _id: Types.ObjectId; name: string } }>({
      path: "workout",
      model: Workout,
      select: "name",
    })
    .sort({ performedAt: -1 })
    .lean();

  const sessions: SerializedSession[] = docs.map((d) => ({
    id: String(d._id),
    client: String(d.client),
    workout: d.workout
      ? { id: String(d.workout._id), name: d.workout.name }
      : undefined,
    performedAt: d.performedAt,
    blocks: d.blocks,
    notes: d.notes,
    totalVolume: d.blocks.reduce(
      (sum, block) =>
        sum + block.sets.reduce((b, set) => b + set.reps * set.weight, 0),
      0
    ),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Your progress
        </h1>
        <p className="mt-1 text-white/60">Every session you&apos;ve logged.</p>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
          <LineIcon className="mx-auto size-6 text-white/40" />
          <p className="mt-3 text-sm text-white/60">
            No sessions yet. Log your first workout from the Today tab.
          </p>
        </div>
      ) : (
        <ClientProgressView sessions={sessions} />
      )}
    </div>
  );
}
