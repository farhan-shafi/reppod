"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ArrowLeft, Loader2, Plus, Save } from "lucide-react";

import type { WorkoutBlockInput, SerializedWorkout } from "@/lib/schemas/workout";
import type { Exercise } from "@/lib/exercises";
import ExercisePickerModal from "./ExercisePickerModal";
import SortableBlock, { type BlockWithKey } from "./SortableBlock";

let keyCounter = 0;
const nextKey = () => `block-${++keyCounter}-${Date.now()}`;

export default function WorkoutBuilder({
  initialWorkout,
}: {
  initialWorkout?: SerializedWorkout;
}) {
  const router = useRouter();
  const editing = Boolean(initialWorkout);

  const [name, setName] = useState(initialWorkout?.name ?? "");
  const [description, setDescription] = useState(
    initialWorkout?.description ?? ""
  );
  const [blocks, setBlocks] = useState<BlockWithKey[]>(
    initialWorkout?.blocks.map((b) => ({ ...b, key: nextKey() })) ?? []
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function addExercise(ex: Exercise) {
    setBlocks((prev) => [
      ...prev,
      {
        key: nextKey(),
        exerciseId: ex.id,
        sets: 3,
        reps: "8-12",
        restSec: 60,
      },
    ]);
    setPickerOpen(false);
  }

  function updateBlock(key: string, updates: Partial<WorkoutBlockInput>) {
    setBlocks((prev) =>
      prev.map((b) => (b.key === key ? { ...b, ...updates } : b))
    );
  }

  function removeBlock(key: string) {
    setBlocks((prev) => prev.filter((b) => b.key !== key));
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setBlocks((prev) => {
      const oldIndex = prev.findIndex((b) => b.key === active.id);
      const newIndex = prev.findIndex((b) => b.key === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }

  async function save() {
    setError(null);

    if (name.trim().length < 2) {
      setError("Give your workout a name (at least 2 characters).");
      return;
    }
    if (blocks.length === 0) {
      setError("Add at least one exercise.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        blocks: blocks.map(({ key: _key, ...rest }) => rest),
      };

      const url = editing
        ? `/api/workouts/${initialWorkout!.id}`
        : "/api/workouts";

      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not save workout.");
        return;
      }

      router.push(`/dashboard/workouts/${data.workout.id}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/dashboard/workouts"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition"
        >
          <ArrowLeft className="size-4" />
          Back to workouts
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
          {editing ? "Edit workout" : "New workout"}
        </h1>
      </div>

      <div className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Workout name — e.g. Push Day A"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-lg font-semibold placeholder-white/30 outline-none focus:border-fuchsia-500/50 transition"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional notes for the client…"
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-fuchsia-500/50 transition resize-none"
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.key)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {blocks.map((block) => (
                <motion.div
                  key={block.key}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <SortableBlock
                    block={block}
                    onChange={(updates) => updateBlock(block.key, updates)}
                    onRemove={() => removeBlock(block.key)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </ul>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-white/15 text-white/70 hover:text-white hover:border-white/30 hover:bg-white/[0.02] transition"
      >
        <Plus className="size-4" />
        Add exercise
      </button>

      {error && (
        <motion.p
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href="/dashboard/workouts"
          className="px-4 py-2 rounded-full text-sm text-white/80 hover:bg-white/5 transition"
        >
          Cancel
        </Link>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Save className="size-3.5" />
          )}
          {editing ? "Save changes" : "Save workout"}
        </button>
      </div>

      <ExercisePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onAdd={addExercise}
      />
    </div>
  );
}
