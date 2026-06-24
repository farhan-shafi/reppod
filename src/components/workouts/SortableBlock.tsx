"use client";

import { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { getExercise, MUSCLE_LABELS } from "@/lib/exercises";
import type { WorkoutBlockInput } from "@/lib/schemas/workout";
import CloudinaryVideo from "./CloudinaryVideo";

export type BlockWithKey = WorkoutBlockInput & { key: string };

export default function SortableBlock({
  block,
  onChange,
  onRemove,
}: {
  block: BlockWithKey;
  onChange: (updates: Partial<WorkoutBlockInput>) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.key });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  const ex = getExercise(block.exerciseId);

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 touch-none"
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 p-1 -ml-1 rounded text-white/40 hover:text-white/80 hover:bg-white/5 transition cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-white truncate">
                {ex?.name ?? "Unknown exercise"}
              </p>
              {ex && (
                <p className="text-xs text-white/40 mt-0.5">
                  {MUSCLE_LABELS[ex.muscle]}
                </p>
              )}
            </div>
            <button
              onClick={onRemove}
              className="p-1 rounded text-white/40 hover:text-red-300 hover:bg-red-500/10 transition"
              aria-label="Remove"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <NumberField
              label="Sets"
              value={block.sets}
              min={1}
              max={20}
              onChange={(v) => onChange({ sets: v })}
            />
            <TextField
              label="Reps"
              value={block.reps}
              placeholder="8-12"
              onChange={(v) => onChange({ reps: v })}
            />
            <NumberField
              label="Rest (s)"
              value={block.restSec}
              min={0}
              max={600}
              step={15}
              onChange={(v) => onChange({ restSec: v })}
            />
          </div>

          <CloudinaryVideo
            videoUrl={block.videoUrl}
            onChange={(url, duration) =>
              onChange({ videoUrl: url, videoDuration: duration })
            }
          />
        </div>
      </div>
    </li>
  );
}

function NumberField({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-white/40">
        {label}
      </span>
      <input
        {...rest}
        type="number"
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
        className="mt-0.5 w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-fuchsia-500/50 transition"
      />
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-white/40">
        {label}
      </span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-fuchsia-500/50 transition"
      />
    </label>
  );
}
