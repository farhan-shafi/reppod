import { Types } from "mongoose";

import { requireClient } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/mongoose";
import { WorkoutSession } from "@/models/WorkoutSession";
import { Workout } from "@/models/Workout";
import { Checkin } from "@/models/Checkin";
import type { SerializedSession } from "@/lib/schemas/progress";
import type { SerializedCheckin } from "@/lib/schemas/checkin";
import ClientProgressView from "@/components/client-portal/ClientProgressView";
import ClientCheckinSection from "@/components/client-portal/ClientCheckinSection";

export const metadata = { title: "Progress · Reppod" };

export default async function ClientProgressPage() {
  const { client } = await requireClient();
  await connectDB();

  const [sessionDocs, checkinDocs] = await Promise.all([
    WorkoutSession.find({ client: client._id })
      .populate<{ workout?: { _id: Types.ObjectId; name: string } }>({
        path: "workout",
        model: Workout,
        select: "name",
      })
      .sort({ performedAt: -1 })
      .lean(),
    Checkin.find({ client: client._id }).sort({ date: -1 }).limit(60).lean(),
  ]);

  const sessions: SerializedSession[] = sessionDocs.map((d) => ({
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

  const checkins: SerializedCheckin[] = checkinDocs.map((c) => ({
    id: String(c._id),
    client: String(c.client),
    date: c.date,
    weightKg: c.weightKg,
    measurements: c.measurements,
    energy: c.energy,
    sleep: c.sleep,
    mood: c.mood,
    adherence: c.adherence,
    note: c.note,
    photos: c.photos,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Your progress
        </h1>
        <p className="mt-1 text-white/60">Check-ins, body weight, and sessions.</p>
      </div>

      <ClientCheckinSection initialCheckins={checkins} />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Training volume</h2>
        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/60">
            No sessions yet. Log your first workout from the Today tab.
          </div>
        ) : (
          <ClientProgressView sessions={sessions} />
        )}
      </div>
    </div>
  );
}
