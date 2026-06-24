import Link from "next/link";
import { Types } from "mongoose";
import { ArrowRight, ClipboardList, Flame } from "lucide-react";

import { requireClient } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/mongoose";
import { WorkoutAssignment } from "@/models/WorkoutAssignment";
import { WorkoutSession } from "@/models/WorkoutSession";
import { Workout } from "@/models/Workout";

export const metadata = { title: "Today · FlexFlow" };

export default async function ClientHome() {
  const { user, client } = await requireClient();
  await connectDB();

  const [assignmentDocs, sessionCount, lastSession] = await Promise.all([
    WorkoutAssignment.find({ client: client._id })
      .populate<{ workout: { _id: Types.ObjectId; name: string; blocks: unknown[] } }>({
        path: "workout",
        model: Workout,
        select: "name blocks",
      })
      .sort({ assignedAt: -1 })
      .lean(),
    WorkoutSession.countDocuments({ client: client._id }),
    WorkoutSession.findOne({ client: client._id })
      .sort({ performedAt: -1 })
      .lean(),
  ]);

  const assignments = assignmentDocs.filter((a) => a.workout);
  const firstName = user.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Hey {firstName} 👋
        </h1>
        <p className="mt-1 text-white/60">Ready to train? Here&apos;s your plan.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50">Workouts logged</span>
            <Flame className="size-4 text-orange-400" />
          </div>
          <div className="mt-3 text-3xl font-semibold text-white">
            {sessionCount}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50">Last session</span>
            <ClipboardList className="size-4 text-fuchsia-400" />
          </div>
          <div className="mt-3 text-sm font-medium text-white">
            {lastSession
              ? new Date(lastSession.performedAt).toLocaleDateString()
              : "—"}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Your workouts</h2>
        {assignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/60">
            Your coach hasn&apos;t assigned any workouts yet. Check back soon!
          </div>
        ) : (
          <ul className="space-y-3">
            {assignments.map((a) => (
              <li key={String(a._id)}>
                <Link
                  href={`/app/workouts/${a.workout._id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/20 hover:bg-white/[0.05] transition"
                >
                  <div className="size-11 rounded-xl bg-gradient-to-br from-fuchsia-500 to-orange-500 flex items-center justify-center">
                    <ClipboardList className="size-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white truncate">
                      {a.workout.name}
                    </p>
                    <p className="text-xs text-white/50">
                      {Array.isArray(a.workout.blocks)
                        ? a.workout.blocks.length
                        : 0}{" "}
                      exercises
                    </p>
                  </div>
                  <ArrowRight className="size-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
