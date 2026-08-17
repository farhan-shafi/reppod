"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";

import { getExercise } from "@/lib/exercises";
import type {
  SerializedAssignment,
  SerializedSession,
  SessionBlockInput,
} from "@/lib/schemas/progress";

type WorkoutBlock = {
  exerciseId: string;
  sets: number;
  reps: string;
};

type WorkoutDetail = {
  id: string;
  name: string;
  blocks: WorkoutBlock[];
};

export default function LogSessionModal({
  open,
  onClose,
  clientId,
  assignments,
  onLogged,
}: {
  open: boolean;
  onClose: () => void;
  clientId: string;
  assignments: SerializedAssignment[];
  onLogged: (session: SerializedSession) => void;
}) {
  const [selectedId, setSelectedId] = useState<string>(
    assignments[0]?.workout.id ?? ""
  );
  const [workout, setWorkout] = useState<WorkoutDetail | null>(null);
  const [blocks, setBlocks] = useState<SessionBlockInput[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSelectedId = assignments.some(
    (assignment) => assignment.workout.id === selectedId
  )
    ? selectedId
    : (assignments[0]?.workout.id ?? "");
  const loadingWorkout = Boolean(
    open && activeSelectedId && workout?.id !== activeSelectedId
  );

  useEffect(() => {
    if (!open || !activeSelectedId) return;
    let active = true;
    fetch(`/api/workouts/${activeSelectedId}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Could not load workout.");
        return data;
      })
      .then((data) => {
        if (!active) return;
        const w: WorkoutDetail = data.workout;
        setWorkout(w);
        setBlocks(
          w.blocks.map((b) => ({
            exerciseId: b.exerciseId,
            sets: Array.from({ length: b.sets }, () => ({
              reps: parseFirstNumber(b.reps),
              weight: 0,
            })),
            notes: "",
          }))
        );
      })
      .catch(() => {
        if (active) setError("Could not load workout.");
      });
    return () => {
      active = false;
    };
  }, [open, activeSelectedId]);

  function updateSet(
    blockIdx: number,
    setIdx: number,
    field: "reps" | "weight",
    value: number
  ) {
    setBlocks((prev) =>
      prev.map((b, i) =>
        i === blockIdx
          ? {
              ...b,
              sets: b.sets.map((s, j) =>
                j === setIdx ? { ...s, [field]: value } : s
              ),
            }
          : b
      )
    );
  }

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workoutId: activeSelectedId,
          blocks,
          notes,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not log session.");
        return;
      }
      onLogged(data.session);
      setNotes("");
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => !saving && onClose()}
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Log session</h2>
              <button
                onClick={onClose}
                disabled={saving}
                className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-5 border-b border-white/10">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-white/50">
                  Workout
                </span>
                <select
                  value={activeSelectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-fuchsia-500/50 transition"
                >
                  {assignments.map((a) => (
                    <option
                      key={a.workout.id}
                      value={a.workout.id}
                      className="bg-zinc-900"
                    >
                      {a.workout.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {loadingWorkout ? (
                <div className="flex items-center justify-center py-12 text-white/50">
                  <Loader2 className="size-5 animate-spin" />
                </div>
              ) : workout ? (
                blocks.map((block, blockIdx) => {
                  const ex = getExercise(block.exerciseId);
                  return (
                    <div
                      key={blockIdx}
                      className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                    >
                      <p className="font-medium text-white text-sm">
                        {ex?.name ?? "Exercise"}
                      </p>
                      <div className="mt-3 space-y-1.5">
                        {block.sets.map((set, setIdx) => (
                          <div
                            key={setIdx}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span className="w-6 text-white/40">
                              #{setIdx + 1}
                            </span>
                            <input
                              type="number"
                              min={0}
                              value={set.reps}
                              onChange={(e) =>
                                updateSet(
                                  blockIdx,
                                  setIdx,
                                  "reps",
                                  Number(e.target.value) || 0
                                )
                              }
                              className="w-20 px-2 py-1 rounded bg-white/5 border border-white/10 text-white outline-none focus:border-fuchsia-500/50 transition"
                            />
                            <span className="text-white/40">reps ×</span>
                            <input
                              type="number"
                              min={0}
                              step={2.5}
                              value={set.weight}
                              onChange={(e) =>
                                updateSet(
                                  blockIdx,
                                  setIdx,
                                  "weight",
                                  Number(e.target.value) || 0
                                )
                              }
                              className="w-20 px-2 py-1 rounded bg-white/5 border border-white/10 text-white outline-none focus:border-fuchsia-500/50 transition"
                            />
                            <span className="text-white/40">kg</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : null}

              <label className="block">
                <span className="text-xs uppercase tracking-wider text-white/50">
                  Session notes (optional)
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="How did it feel? Any cues?"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-fuchsia-500/50 transition resize-none"
                />
              </label>

              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-full text-sm text-white/80 hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving || !workout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition disabled:opacity-60"
              >
                {saving && <Loader2 className="size-3.5 animate-spin" />}
                Save session
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function parseFirstNumber(reps: string): number {
  const match = reps.match(/\d+/);
  return match ? Number(match[0]) : 8;
}
