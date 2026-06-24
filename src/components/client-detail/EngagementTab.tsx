"use client";

import { motion } from "framer-motion";
import { Check, Video } from "lucide-react";
import { getExercise } from "@/lib/exercises";

export type EngagementItem = {
  workoutId: string;
  workoutName: string;
  exerciseId: string;
  percent: number;
  completed: boolean;
};

export default function EngagementTab({
  clientName,
  videos,
  sessionCount,
}: {
  clientName: string;
  videos: EngagementItem[];
  sessionCount: number;
}) {
  if (videos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/60">
        No demo videos on {clientName}&apos;s assigned workouts yet. Add videos to
        exercises in the workout builder, and watch stats will show up here.
      </div>
    );
  }

  const watched = videos.filter((v) => v.completed).length;
  const avgPercent =
    videos.reduce((sum, v) => sum + v.percent, 0) / videos.length;

  // Group by workout for display.
  const byWorkout = new Map<string, { name: string; items: EngagementItem[] }>();
  for (const v of videos) {
    const entry = byWorkout.get(v.workoutId) ?? { name: v.workoutName, items: [] };
    entry.items.push(v);
    byWorkout.set(v.workoutId, entry);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Stat label="Videos watched" value={`${watched}/${videos.length}`} />
        <Stat label="Avg watched" value={`${Math.round(avgPercent * 100)}%`} />
        <Stat label="Sessions logged" value={String(sessionCount)} />
      </div>

      {[...byWorkout.entries()].map(([workoutId, group]) => (
        <div
          key={workoutId}
          className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2">
            <Video className="size-4 text-fuchsia-300" />
            <span className="text-sm font-medium text-white">{group.name}</span>
          </div>
          <ul className="divide-y divide-white/5">
            {group.items.map((v) => {
              const ex = getExercise(v.exerciseId);
              return (
                <li
                  key={v.exerciseId}
                  className="px-5 py-3 flex items-center gap-4"
                >
                  <span className="min-w-0 flex-1 text-sm text-white truncate">
                    {ex?.name ?? v.exerciseId}
                  </span>
                  <div className="w-32 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(v.percent * 100)}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-fuchsia-500 to-orange-500"
                    />
                  </div>
                  <span className="w-10 text-right text-xs text-white/50">
                    {Math.round(v.percent * 100)}%
                  </span>
                  {v.completed ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-300 w-20 justify-end">
                      <Check className="size-3" />
                      Watched
                    </span>
                  ) : (
                    <span className="text-xs text-white/30 w-20 text-right">
                      In progress
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-xs text-white/50">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}
