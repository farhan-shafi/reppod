"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Loader2 } from "lucide-react";

import { getExercise, MUSCLE_LABELS } from "@/lib/exercises";
import type { SessionBlockInput } from "@/lib/schemas/progress";
import ExerciseVideo from "./ExerciseVideo";

type WorkoutBlock = {
  exerciseId: string;
  sets: number;
  reps: string;
  restSec: number;
  videoUrl?: string;
  videoPercent?: number;
  videoCompleted?: boolean;
};

type Workout = {
  id: string;
  name: string;
  description?: string;
  blocks: WorkoutBlock[];
};

function parseFirstNumber(reps: string): number {
  const match = reps.match(/\d+/);
  return match ? Number(match[0]) : 8;
}

export default function ClientWorkoutView({ workout }: { workout: Workout }) {
  const router = useRouter();
  const [logging, setLogging] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [blocks, setBlocks] = useState<SessionBlockInput[]>(
    workout.blocks.map((b) => ({
      exerciseId: b.exerciseId,
      sets: Array.from({ length: b.sets }, () => ({
        reps: parseFirstNumber(b.reps),
        weight: 0,
      })),
      notes: "",
    }))
  );
  const [notes, setNotes] = useState("");

  function updateSet(
    bi: number,
    si: number,
    field: "reps" | "weight",
    value: number
  ) {
    setBlocks((prev) =>
      prev.map((b, i) =>
        i === bi
          ? {
              ...b,
              sets: b.sets.map((s, j) =>
                j === si ? { ...s, [field]: value } : s
              ),
            }
          : b
      )
    );
  }

  async function logSession() {
    setError(null);
    setLogging(true);
    try {
      const res = await fetch("/api/me/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workoutId: workout.id, blocks, notes }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not log workout.");
        return;
      }
      setDone(true);
      setTimeout(() => {
        router.push("/app/progress");
        router.refresh();
      }, 1200);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLogging(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Link
        href="/app"
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {workout.name}
        </h1>
        {workout.description && (
          <p className="mt-2 text-white/70">{workout.description}</p>
        )}
        <p className="mt-2 text-sm text-white/40">
          Fill in your reps and weight as you go, then log the session.
        </p>
      </div>

      <div className="space-y-4">
        {blocks.map((block, bi) => {
          const ex = getExercise(block.exerciseId);
          const target = workout.blocks[bi];
          return (
            <div
              key={bi}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-baseline justify-between">
                <p className="font-medium text-white">
                  {ex?.name ?? "Exercise"}
                </p>
                <span className="text-xs text-white/40">
                  target {target.sets}×{target.reps}
                </span>
              </div>
              {ex && (
                <p className="text-xs text-white/40 mt-0.5">
                  {MUSCLE_LABELS[ex.muscle]} · {target.restSec}s rest
                </p>
              )}

              {target.videoUrl && (
                <ExerciseVideo
                  workoutId={workout.id}
                  exerciseId={block.exerciseId}
                  videoUrl={target.videoUrl}
                  initialPercent={target.videoPercent ?? 0}
                  initialCompleted={target.videoCompleted ?? false}
                />
              )}

              <div className="mt-3 space-y-1.5">
                {block.sets.map((set, si) => (
                  <div key={si} className="flex items-center gap-2 text-sm">
                    <span className="w-7 text-white/40 text-xs">#{si + 1}</span>
                    <input
                      type="number"
                      min={0}
                      value={set.reps}
                      onChange={(e) =>
                        updateSet(bi, si, "reps", Number(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white outline-none focus:border-fuchsia-500/50 transition"
                    />
                    <span className="text-white/40 text-xs">reps ×</span>
                    <input
                      type="number"
                      min={0}
                      step={2.5}
                      value={set.weight}
                      onChange={(e) =>
                        updateSet(bi, si, "weight", Number(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white outline-none focus:border-fuchsia-500/50 transition"
                    />
                    <span className="text-white/40 text-xs">kg</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <label className="block">
          <span className="text-xs uppercase tracking-wider text-white/50">
            How did it feel? (optional)
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Felt strong, bumped up the bench…"
            className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-fuchsia-500/50 transition resize-none"
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center justify-center gap-2 py-3 rounded-full bg-emerald-500/15 text-emerald-300 font-medium"
          >
            <Check className="size-5" />
            Logged! Great work 💪
          </motion.div>
        ) : (
          <motion.button
            key="log"
            whileTap={{ scale: 0.98 }}
            onClick={logSession}
            disabled={logging}
            className="w-full py-3 rounded-full bg-white text-black font-medium hover:bg-white/90 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {logging && <Loader2 className="size-4 animate-spin" />}
            Log this session
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
