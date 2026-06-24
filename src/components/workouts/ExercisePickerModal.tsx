"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, X } from "lucide-react";
import {
  EXERCISES,
  MUSCLE_GROUPS,
  MUSCLE_LABELS,
  EQUIPMENT_LABELS,
  type Exercise,
  type MuscleGroup,
} from "@/lib/exercises";
import { cn } from "@/lib/utils";

type Filter = "all" | MuscleGroup;

export default function ExercisePickerModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (exercise: Exercise) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter((e) => {
      if (filter !== "all" && e.muscle !== filter) return false;
      if (q && !e.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, filter]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Add exercise</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-5 border-b border-white/10 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoFocus
                  placeholder="Search exercises…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm outline-none focus:border-fuchsia-500/50 transition"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <FilterChip
                  active={filter === "all"}
                  onClick={() => setFilter("all")}
                >
                  All
                </FilterChip>
                {MUSCLE_GROUPS.map((m) => (
                  <FilterChip
                    key={m}
                    active={filter === m}
                    onClick={() => setFilter(m)}
                  >
                    {MUSCLE_LABELS[m]}
                  </FilterChip>
                ))}
              </div>
            </div>

            <ul className="flex-1 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <li className="p-8 text-center text-sm text-white/40">
                  No exercises match your search.
                </li>
              ) : (
                filtered.map((ex) => (
                  <li key={ex.id}>
                    <button
                      onClick={() => onAdd(ex)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition text-left"
                    >
                      <div className="size-9 rounded-lg bg-gradient-to-br from-fuchsia-500/30 to-orange-500/20 flex items-center justify-center">
                        <Plus className="size-4 text-white/80" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                          {ex.name}
                        </p>
                        <p className="text-xs text-white/40">
                          {MUSCLE_LABELS[ex.muscle]} · {EQUIPMENT_LABELS[ex.equipment]}
                        </p>
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1 rounded-full text-xs border transition",
        active
          ? "bg-white text-black border-white"
          : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
      )}
    >
      {children}
    </button>
  );
}
