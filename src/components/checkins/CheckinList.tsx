"use client";

import { motion } from "framer-motion";
import {
  RATING_FIELDS,
  RATING_LABELS,
  type SerializedCheckin,
} from "@/lib/schemas/checkin";

export default function CheckinList({
  checkins,
  onDelete,
}: {
  checkins: SerializedCheckin[];
  onDelete?: (id: string) => void;
}) {
  if (checkins.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-white/50">
        No check-ins yet.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {checkins.map((c) => (
        <motion.li
          key={c.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white">
                {new Date(c.date).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              {c.weightKg !== undefined && (
                <p className="text-xs text-white/50">{c.weightKg} kg</p>
              )}
            </div>
            {onDelete && (
              <button
                onClick={() => onDelete(c.id)}
                className="text-xs text-white/40 hover:text-red-300 transition"
              >
                Delete
              </button>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {RATING_FIELDS.map((r) => {
              const v = c[r];
              if (!v) return null;
              return (
                <span
                  key={r}
                  className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-white/70"
                >
                  {RATING_LABELS[r]} {v}/5
                </span>
              );
            })}
            {c.photos.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-[11px] text-fuchsia-200">
                {c.photos.length} photo{c.photos.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {c.note && (
            <p className="mt-2 text-xs text-white/60 whitespace-pre-wrap">{c.note}</p>
          )}
        </motion.li>
      ))}
    </ul>
  );
}
