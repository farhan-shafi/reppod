"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2, Plus, Save, Trash2, Utensils } from "lucide-react";

import {
  computeMacros,
  type MealItemInput,
  type SerializedMealPlan,
} from "@/lib/schemas/nutrition";
import type { Macros } from "@/lib/foods";
import FoodPickerModal from "./FoodPickerModal";
import MacroBars from "./MacroBars";

type Meal = { title: string; items: MealItemInput[] };

const DEFAULT_TARGETS: Macros = { calories: 2200, protein: 160, carbs: 220, fat: 70 };

export default function MealPlanBuilder({
  initialPlan,
}: {
  initialPlan?: SerializedMealPlan;
}) {
  const router = useRouter();
  const editing = Boolean(initialPlan);

  const [name, setName] = useState(initialPlan?.name ?? "");
  const [description, setDescription] = useState(initialPlan?.description ?? "");
  const [targets, setTargets] = useState<Macros>(
    initialPlan?.targets ?? DEFAULT_TARGETS
  );
  const [meals, setMeals] = useState<Meal[]>(
    initialPlan?.meals?.map((m) => ({ title: m.title, items: m.items })) ?? [
      { title: "Breakfast", items: [] },
    ]
  );
  const [pickerForMeal, setPickerForMeal] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dayTotals = useMemo(
    () => computeMacros(meals.flatMap((m) => m.items)),
    [meals]
  );

  function addMeal() {
    setMeals((prev) => [...prev, { title: `Meal ${prev.length + 1}`, items: [] }]);
  }
  function removeMeal(i: number) {
    setMeals((prev) => prev.filter((_, idx) => idx !== i));
  }
  function renameMeal(i: number, title: string) {
    setMeals((prev) => prev.map((m, idx) => (idx === i ? { ...m, title } : m)));
  }
  function addItem(mealIdx: number, item: MealItemInput) {
    setMeals((prev) =>
      prev.map((m, idx) =>
        idx === mealIdx ? { ...m, items: [...m.items, item] } : m
      )
    );
    setPickerForMeal(null);
  }
  function removeItem(mealIdx: number, itemIdx: number) {
    setMeals((prev) =>
      prev.map((m, idx) =>
        idx === mealIdx
          ? { ...m, items: m.items.filter((_, j) => j !== itemIdx) }
          : m
      )
    );
  }

  async function save() {
    setError(null);
    if (name.trim().length < 2) {
      setError("Give the plan a name (at least 2 characters).");
      return;
    }
    const cleanMeals = meals.filter((m) => m.items.length > 0);
    if (cleanMeals.length === 0) {
      setError("Add at least one meal with food.");
      return;
    }

    setSaving(true);
    try {
      const payload = { name: name.trim(), description: description.trim(), targets, meals: cleanMeals };
      const url = editing ? `/api/meal-plans/${initialPlan!.id}` : "/api/meal-plans";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not save meal plan.");
        return;
      }
      router.push(`/dashboard/nutrition/${data.mealPlan.id}`);
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
          href="/dashboard/nutrition"
          className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition"
        >
          <ArrowLeft className="size-4" />
          Back to nutrition
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
          {editing ? "Edit meal plan" : "New meal plan"}
        </h1>
      </div>

      <div className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Plan name — e.g. Cutting 2200 kcal"
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

      {/* Targets */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <h3 className="text-xs uppercase tracking-wider text-white/50 mb-3">
          Daily targets
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {(["calories", "protein", "carbs", "fat"] as const).map((k) => (
            <label key={k} className="block">
              <span className="text-[10px] uppercase tracking-wider text-white/40">
                {k === "calories" ? "kcal" : `${k} (g)`}
              </span>
              <input
                type="number"
                min={0}
                value={targets[k]}
                onChange={(e) =>
                  setTargets({ ...targets, [k]: Number(e.target.value) || 0 })
                }
                className="mt-0.5 w-full px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-fuchsia-500/50 transition"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Live day totals vs target */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-white/50 mb-2">
          Plan total vs target
        </h3>
        <MacroBars current={dayTotals} target={targets} />
      </div>

      {/* Meals */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {meals.map((meal, mi) => {
            const mealTotals = computeMacros(meal.items);
            return (
              <motion.div
                key={mi}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-center gap-2">
                  <Utensils className="size-4 text-fuchsia-300 shrink-0" />
                  <input
                    value={meal.title}
                    onChange={(e) => renameMeal(mi, e.target.value)}
                    className="flex-1 bg-transparent text-white font-medium outline-none border-b border-transparent focus:border-white/20 transition"
                  />
                  <span className="text-xs text-white/40">
                    {mealTotals.calories} kcal
                  </span>
                  <button
                    onClick={() => removeMeal(mi)}
                    className="p-1 rounded text-white/40 hover:text-red-300 hover:bg-red-500/10 transition"
                    aria-label="Remove meal"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {meal.items.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {meal.items.map((item, ii) => (
                      <li
                        key={ii}
                        className="flex items-center gap-2 text-sm text-white/80"
                      >
                        <span className="flex-1 truncate">
                          {item.name}{" "}
                          <span className="text-white/40">({item.qtyGrams}g)</span>
                        </span>
                        <span className="text-xs text-white/40">
                          {item.calories} kcal · {item.protein}P/{item.carbs}C/{item.fat}F
                        </span>
                        <button
                          onClick={() => removeItem(mi, ii)}
                          className="text-white/30 hover:text-red-300 transition"
                          aria-label="Remove item"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  onClick={() => setPickerForMeal(mi)}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-white/15 text-white/60 text-xs hover:text-white hover:border-white/30 transition"
                >
                  <Plus className="size-3.5" />
                  Add food
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>

        <button
          onClick={addMeal}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-white/15 text-white/70 hover:text-white hover:border-white/30 hover:bg-white/[0.02] transition"
        >
          <Plus className="size-4" />
          Add meal
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href="/dashboard/nutrition"
          className="px-4 py-2 rounded-full text-sm text-white/80 hover:bg-white/5 transition"
        >
          Cancel
        </Link>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition disabled:opacity-60"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          {editing ? "Save changes" : "Save plan"}
        </button>
      </div>

      <FoodPickerModal
        open={pickerForMeal !== null}
        onClose={() => setPickerForMeal(null)}
        onAdd={(item) => pickerForMeal !== null && addItem(pickerForMeal, item)}
      />
    </div>
  );
}
