import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";

import { requireUser } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/mongoose";
import { Workout } from "@/models/Workout";
import { getExercise } from "@/lib/exercises";

export const metadata = {
  title: "Workouts · Reppod",
};

export default async function WorkoutsPage() {
  const user = await requireUser();
  await connectDB();

  const docs = await Workout.find({ trainer: user.id })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Workouts
          </h1>
          <p className="mt-1 text-white/60">
            {docs.length === 0
              ? "Build a workout to start coaching."
              : `${docs.length} workout${docs.length === 1 ? "" : "s"} in your library.`}
          </p>
        </div>
        <Link
          href="/dashboard/workouts/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition self-start sm:self-auto"
        >
          <Plus className="size-4" />
          New workout
        </Link>
      </div>

      {docs.length === 0 ? (
        <Link
          href="/dashboard/workouts/new"
          className="block rounded-2xl border border-dashed border-white/15 p-12 text-center hover:border-white/30 transition"
        >
          <div className="mx-auto size-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-orange-500 flex items-center justify-center">
            <ClipboardList className="size-5 text-white" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-white">
            No workouts yet
          </h2>
          <p className="mt-1 text-sm text-white/60 max-w-sm mx-auto">
            Build your first workout — drag in exercises, set reps and rest, save
            as a reusable template.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium">
            + New workout
          </span>
        </Link>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {docs.map((w) => {
            const id = String(w._id);
            const totalSets = w.blocks.reduce((sum, b) => sum + (b.sets ?? 0), 0);
            const preview = w.blocks
              .slice(0, 3)
              .map((b) => getExercise(b.exerciseId)?.name ?? b.exerciseId);

            return (
              <li key={id}>
                <Link
                  href={`/dashboard/workouts/${id}`}
                  className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-white/20 hover:bg-white/[0.05] transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-white truncate group-hover:text-fuchsia-300 transition">
                      {w.name}
                    </h3>
                    <span className="shrink-0 text-xs text-white/40">
                      {w.blocks.length} exercise{w.blocks.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  {w.description && (
                    <p className="mt-1 text-xs text-white/50 line-clamp-2">
                      {w.description}
                    </p>
                  )}

                  <ul className="mt-4 space-y-1.5">
                    {preview.map((name, i) => (
                      <li
                        key={i}
                        className="text-xs text-white/70 truncate flex items-center gap-2"
                      >
                        <span className="size-1 rounded-full bg-fuchsia-400/60" />
                        {name}
                      </li>
                    ))}
                    {w.blocks.length > 3 && (
                      <li className="text-xs text-white/40">
                        + {w.blocks.length - 3} more
                      </li>
                    )}
                  </ul>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-white/40">
                      ~{totalSets} sets total
                    </span>
                    <span className="text-fuchsia-300/80 group-hover:text-fuchsia-300 transition">
                      Open →
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
