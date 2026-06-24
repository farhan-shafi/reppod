"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Pencil, Trash2, Utensils } from "lucide-react";

import { computeMacros, type SerializedMealPlan } from "@/lib/schemas/nutrition";
import MealPlanBuilder from "@/components/nutrition/MealPlanBuilder";
import MacroBars from "@/components/nutrition/MacroBars";

export default function MealPlanDetailView({
  mealPlan,
}: {
  mealPlan: SerializedMealPlan;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (editing) return <MealPlanBuilder initialPlan={mealPlan} />;

  const dayTotals = computeMacros(mealPlan.meals.flatMap((m) => m.items));

  async function onDelete() {
    if (!confirm(`Delete "${mealPlan.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/meal-plans/${mealPlan.id}`, { method: "DELETE" });
      if (!res.ok) {
        setDeleting(false);
        alert("Could not delete meal plan.");
        return;
      }
      router.push("/dashboard/nutrition");
      router.refresh();
    } catch {
      setDeleting(false);
      alert("Network error. Try again.");
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/dashboard/nutrition"
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition"
      >
        <ArrowLeft className="size-4" />
        Back to nutrition
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {mealPlan.name}
          </h1>
          {mealPlan.description && (
            <p className="mt-2 text-white/70 whitespace-pre-wrap">
              {mealPlan.description}
            </p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm hover:bg-white/15 transition"
          >
            <Pencil className="size-3.5" />
            Edit
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/15 text-red-300 text-sm hover:bg-red-500/25 transition disabled:opacity-60"
          >
            {deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
            Delete
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-wider text-white/50 mb-2">
          Plan total vs daily target
        </h3>
        <MacroBars current={dayTotals} target={mealPlan.targets} />
      </div>

      <div className="space-y-3">
        {mealPlan.meals.map((meal, mi) => {
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
                  {totals.calories} kcal · {totals.protein}P/{totals.carbs}C/{totals.fat}F
                </span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {meal.items.map((item, ii) => (
                  <li key={ii} className="flex items-center gap-2 text-sm text-white/80">
                    <span className="flex-1 truncate">
                      {item.name} <span className="text-white/40">({item.qtyGrams}g)</span>
                    </span>
                    <span className="text-xs text-white/40">{item.calories} kcal</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
