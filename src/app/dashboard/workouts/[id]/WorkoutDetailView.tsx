"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Pencil, Trash2 } from "lucide-react";

import { getExercise, MUSCLE_LABELS } from "@/lib/exercises";
import type { SerializedWorkout } from "@/lib/schemas/workout";
import WorkoutBuilder from "@/components/workouts/WorkoutBuilder";

export default function WorkoutDetailView({
  workout,
}: {
  workout: SerializedWorkout;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (editing) {
    return <WorkoutBuilder initialWorkout={workout} />;
  }

  async function onDelete() {
    if (!confirm(`Delete "${workout.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/workouts/${workout.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setDeleting(false);
        alert("Could not delete workout.");
        return;
      }
      router.push("/dashboard/workouts");
      router.refresh();
    } catch {
      setDeleting(false);
      alert("Network error. Try again.");
    }
  }

  const totalSets = workout.blocks.reduce((sum, b) => sum + (b.sets ?? 0), 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/dashboard/workouts"
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition"
      >
        <ArrowLeft className="size-4" />
        Back to workouts
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {workout.name}
          </h1>
          {workout.description && (
            <p className="mt-2 text-white/70 whitespace-pre-wrap">
              {workout.description}
            </p>
          )}
          <p className="mt-2 text-sm text-white/40">
            {workout.blocks.length} exercise
            {workout.blocks.length === 1 ? "" : "s"} · ~{totalSets} sets total
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm hover:bg-white/15 transition"
          >
            <Pencil className="size-3.5" />
            Edit
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/15 text-red-300 text-sm hover:bg-red-500/25 transition disabled:opacity-60"
          >
            {deleting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            Delete
          </button>
        </div>
      </div>

      <ol className="space-y-3">
        {workout.blocks.map((block, i) => {
          const ex = getExercise(block.exerciseId);
          return (
            <li
              key={i}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-start gap-4"
            >
              <span className="shrink-0 size-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white/60 font-medium">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">
                  {ex?.name ?? "Unknown exercise"}
                </p>
                {ex && (
                  <p className="text-xs text-white/40 mt-0.5">
                    {MUSCLE_LABELS[ex.muscle]}
                  </p>
                )}
                <div className="mt-2 flex gap-3 text-xs text-white/70">
                  <span>
                    <strong className="text-white">{block.sets}</strong> sets
                  </span>
                  <span className="text-white/30">·</span>
                  <span>
                    <strong className="text-white">{block.reps}</strong> reps
                  </span>
                  <span className="text-white/30">·</span>
                  <span>
                    <strong className="text-white">{block.restSec}s</strong> rest
                  </span>
                </div>
                {block.notes && (
                  <p className="mt-2 text-xs text-white/50">{block.notes}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
