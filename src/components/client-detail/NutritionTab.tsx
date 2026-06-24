"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Plus, Utensils, X } from "lucide-react";

import type {
  SerializedMealPlanAssignment,
  SerializedFoodLog,
} from "@/lib/schemas/nutrition";
import type { Macros } from "@/lib/foods";
import MacroBars from "@/components/nutrition/MacroBars";

type PlanOption = { id: string; name: string; targets: Macros; mealCount: number };

export default function NutritionTab({
  clientId,
  clientName,
  planOptions,
  initialAssignments,
  recentLogs,
}: {
  clientId: string;
  clientName: string;
  planOptions: PlanOption[];
  initialAssignments: SerializedMealPlanAssignment[];
  recentLogs: SerializedFoodLog[];
}) {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const assignedIds = new Set(assignments.map((a) => a.mealPlan.id));
  const available = planOptions.filter((p) => !assignedIds.has(p.id));
  const activeTarget = assignments[0]?.mealPlan.targets;
  const latestLog = recentLogs[0];

  async function assign(mealPlanId: string) {
    try {
      const res = await fetch(`/api/clients/${clientId}/meal-plans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealPlanId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error ?? "Could not assign meal plan.");
        return;
      }
      setAssignments((prev) => [data.assignment, ...prev]);
      setPickerOpen(false);
    } catch {
      alert("Network error. Try again.");
    }
  }

  async function unassign(id: string) {
    if (!confirm("Remove this meal plan from this client?")) return;
    setRemovingId(id);
    try {
      const res = await fetch(`/api/clients/${clientId}/meal-plans/${id}`, {
        method: "DELETE",
      });
      if (res.ok) setAssignments((prev) => prev.filter((a) => a.id !== id));
      else alert("Could not remove assignment.");
    } catch {
      alert("Network error.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Nutrition</h2>
        <button
          onClick={() => setPickerOpen(true)}
          disabled={planOptions.length === 0}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition disabled:opacity-50"
        >
          <Plus className="size-3.5" />
          Assign meal plan
        </button>
      </div>

      {/* Latest logged day vs target */}
      {latestLog && activeTarget && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="text-xs uppercase tracking-wider text-white/50 mb-3">
            Latest logged day ({new Date(latestLog.date).toLocaleDateString()})
          </h3>
          <MacroBars current={latestLog.totals} target={activeTarget} />
        </div>
      )}

      {/* Assigned plans */}
      {planOptions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
          <p className="text-sm text-white/60">
            You haven&apos;t built any meal plans yet.
          </p>
          <Link
            href="/dashboard/nutrition/new"
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition"
          >
            <Plus className="size-3.5" />
            Build your first meal plan
          </Link>
        </div>
      ) : assignments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/60">
          No meal plan assigned to {clientName} yet.
        </div>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence mode="popLayout">
            {assignments.map((a) => (
              <motion.li
                key={a.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-4"
              >
                <div className="size-10 rounded-xl bg-gradient-to-br from-fuchsia-500/30 to-orange-500/20 flex items-center justify-center">
                  <Utensils className="size-4 text-white/80" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/dashboard/nutrition/${a.mealPlan.id}`}
                    className="font-medium text-white hover:text-fuchsia-300 transition truncate block"
                  >
                    {a.mealPlan.name}
                  </Link>
                  <p className="text-xs text-white/50">
                    {a.mealPlan.targets.calories} kcal target · {a.mealPlan.mealCount} meals
                  </p>
                </div>
                <button
                  onClick={() => unassign(a.id)}
                  disabled={removingId === a.id}
                  className="p-1.5 rounded-md text-white/50 hover:text-red-300 hover:bg-red-500/10 transition disabled:opacity-50"
                  aria-label="Remove assignment"
                >
                  {removingId === a.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <X className="size-4" />
                  )}
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* Recent food logs */}
      {recentLogs.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-white/50 mb-2">
            Recent food logs
          </h3>
          <ul className="space-y-2">
            {recentLogs.map((log) => (
              <li
                key={log.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex items-center justify-between text-sm"
              >
                <span className="text-white/70">
                  {new Date(log.date).toLocaleDateString()} · {log.entries.length} items
                </span>
                <span className="text-white/50 text-xs">
                  {Math.round(log.totals.calories)} kcal · {Math.round(log.totals.protein)}P
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Assign picker */}
      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setPickerOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md max-h-[70vh] flex flex-col rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">Pick a meal plan</h2>
                <button
                  onClick={() => setPickerOpen(false)}
                  className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition"
                >
                  <X className="size-5" />
                </button>
              </div>
              <ul className="flex-1 overflow-y-auto p-2">
                {available.length === 0 ? (
                  <li className="p-8 text-center text-sm text-white/50">
                    All your meal plans are already assigned to this client.
                  </li>
                ) : (
                  available.map((p) => (
                    <li key={p.id}>
                      <button
                        onClick={() => assign(p.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition text-left"
                      >
                        <div className="size-9 rounded-lg bg-gradient-to-br from-fuchsia-500/30 to-orange-500/20 flex items-center justify-center">
                          <Utensils className="size-4 text-white/80" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">{p.name}</p>
                          <p className="text-xs text-white/40">
                            {p.targets.calories} kcal · {p.mealCount} meals
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
    </div>
  );
}
