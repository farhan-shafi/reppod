"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Plus, Trash2, Utensils } from "lucide-react";

import {
  computeMacros,
  type MealItemInput,
  type SerializedFoodLog,
} from "@/lib/schemas/nutrition";
import type { Macros } from "@/lib/foods";
import MacroBars from "@/components/nutrition/MacroBars";
import FoodPickerModal from "@/components/nutrition/FoodPickerModal";

type Plan = {
  id: string;
  name: string;
  description?: string;
  targets: Macros;
  meals: { title: string; items: MealItemInput[] }[];
};

function isToday(d: string | Date) {
  const date = new Date(d);
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

export default function ClientNutritionView({
  plan,
  initialLogs,
}: {
  plan: Plan;
  initialLogs: SerializedFoodLog[];
}) {
  const [logs, setLogs] = useState(initialLogs);
  const [draft, setDraft] = useState<MealItemInput[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Today's totals = already-logged today + current draft.
  const todayLogged = useMemo(
    () =>
      logs
        .filter((l) => isToday(l.date))
        .flatMap((l) => l.entries),
    [logs]
  );
  const todayTotals = useMemo(
    () => computeMacros([...todayLogged, ...draft]),
    [todayLogged, draft]
  );

  function addToDraft(item: MealItemInput) {
    setDraft((prev) => [...prev, item]);
    setPickerOpen(false);
  }
  function removeFromDraft(i: number) {
    setDraft((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function saveLog() {
    if (draft.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/me/food-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealPlanId: plan.id, entries: draft }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error ?? "Could not log food.");
        return;
      }
      setLogs((prev) => [data.log, ...prev]);
      setDraft([]);
    } catch {
      alert("Network error. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Nutrition</h1>
        <p className="mt-1 text-white/60">{plan.name}</p>
      </div>

      {/* Today's macros vs target */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="text-xs uppercase tracking-wider text-white/50 mb-3">
          Today vs your targets
        </h3>
        <MacroBars current={todayTotals} target={plan.targets} />
      </div>

      {/* Log food */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-white">Log food</h3>
          <button
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm hover:bg-white/15 transition"
          >
            <Plus className="size-3.5" />
            Add
          </button>
        </div>

        {draft.length === 0 ? (
          <p className="mt-3 text-sm text-white/40">
            Add what you ate, then save it to today&apos;s log.
          </p>
        ) : (
          <>
            <ul className="mt-3 space-y-1.5">
              {draft.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                  <span className="flex-1 truncate">
                    {item.name} <span className="text-white/40">({item.qtyGrams}g)</span>
                  </span>
                  <span className="text-xs text-white/40">{item.calories} kcal</span>
                  <button
                    onClick={() => removeFromDraft(i)}
                    className="text-white/30 hover:text-red-300 transition"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={saveLog}
              disabled={saving}
              className="mt-4 w-full py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              Save to today&apos;s log
            </button>
          </>
        )}
      </div>

      {/* Reference: the plan */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-white/50 mb-2">
          Your meal plan
        </h3>
        <div className="space-y-3">
          {plan.meals.map((meal, mi) => {
            const totals = computeMacros(meal.items);
            return (
              <div
                key={mi}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-center gap-2">
                  <Utensils className="size-4 text-fuchsia-300" />
                  <span className="font-medium text-white">{meal.title}</span>
                  <span className="ml-auto text-xs text-white/40">
                    {totals.calories} kcal
                  </span>
                </div>
                <ul className="mt-2 space-y-1">
                  {meal.items.map((item, ii) => (
                    <li key={ii} className="text-sm text-white/70 truncate">
                      • {item.name}{" "}
                      <span className="text-white/40">({item.qtyGrams}g)</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent logs */}
      {logs.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-white/50 mb-2">
            Recent logs
          </h3>
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {logs.slice(0, 7).map((log) => (
                <motion.li
                  key={log.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex items-center justify-between text-sm"
                >
                  <span className="text-white/70">
                    {new Date(log.date).toLocaleDateString()} · {log.entries.length} items
                  </span>
                  <span className="text-white/50 text-xs">
                    {Math.round(log.totals.calories)} kcal · {Math.round(log.totals.protein)}P
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      )}

      <FoodPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onAdd={addToDraft}
      />
    </div>
  );
}
