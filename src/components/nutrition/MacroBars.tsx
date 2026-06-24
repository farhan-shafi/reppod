"use client";

import { motion } from "framer-motion";
import type { Macros } from "@/lib/foods";

const MACROS: { key: keyof Macros; label: string; unit: string; color: string }[] = [
  { key: "calories", label: "Calories", unit: "kcal", color: "from-fuchsia-500 to-pink-500" },
  { key: "protein", label: "Protein", unit: "g", color: "from-sky-500 to-indigo-500" },
  { key: "carbs", label: "Carbs", unit: "g", color: "from-amber-500 to-orange-500" },
  { key: "fat", label: "Fat", unit: "g", color: "from-emerald-500 to-teal-500" },
];

export default function MacroBars({
  current,
  target,
  animate = true,
}: {
  current: Macros;
  target?: Macros;
  animate?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {MACROS.map((m) => {
        const cur = Math.round(current[m.key]);
        const tgt = target ? Math.round(target[m.key]) : undefined;
        const pct = tgt && tgt > 0 ? Math.min(1, cur / tgt) : 0;
        const over = tgt ? cur > tgt : false;
        return (
          <div key={m.key} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-white/50">{m.label}</span>
              <span className="text-xs text-white/40">{m.unit}</span>
            </div>
            <div className="mt-1 text-lg font-semibold text-white">
              {cur}
              {tgt !== undefined && (
                <span className="text-sm font-normal text-white/40"> / {tgt}</span>
              )}
            </div>
            {tgt !== undefined && (
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={animate ? { width: 0 } : false}
                  animate={{ width: `${Math.round(pct * 100)}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${
                    over ? "from-red-500 to-rose-500" : m.color
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
