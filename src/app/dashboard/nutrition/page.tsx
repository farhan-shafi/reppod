import Link from "next/link";
import { Plus, Utensils } from "lucide-react";

import { requireTrainer } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/mongoose";
import { MealPlan } from "@/models/MealPlan";
import { getLimits } from "@/lib/billing/subscription";
import UpgradeGate from "@/components/billing/UpgradeGate";

export const metadata = { title: "Nutrition · FlexFlow" };

export default async function NutritionPage() {
  const user = await requireTrainer();

  const limits = await getLimits(user.id);
  if (!limits.nutrition) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Nutrition</h1>
        <UpgradeGate
          feature="Nutrition & meal plans"
          description="Build meal plans with macro targets, assign them to clients, and track their food logs. Available on Pro and Studio."
        />
      </div>
    );
  }

  await connectDB();

  const docs = await MealPlan.find({ trainer: user.id })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Nutrition</h1>
          <p className="mt-1 text-white/60">
            {docs.length === 0
              ? "Build a meal plan to assign to clients."
              : `${docs.length} meal plan${docs.length === 1 ? "" : "s"} in your library.`}
          </p>
        </div>
        <Link
          href="/dashboard/nutrition/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition self-start sm:self-auto"
        >
          <Plus className="size-4" />
          New meal plan
        </Link>
      </div>

      {docs.length === 0 ? (
        <Link
          href="/dashboard/nutrition/new"
          className="block rounded-2xl border border-dashed border-white/15 p-12 text-center hover:border-white/30 transition"
        >
          <div className="mx-auto size-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-orange-500 flex items-center justify-center">
            <Utensils className="size-5 text-white" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-white">No meal plans yet</h2>
          <p className="mt-1 text-sm text-white/60 max-w-sm mx-auto">
            Build a plan with daily macro targets and meals, then assign it to clients.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium">
            + New meal plan
          </span>
        </Link>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {docs.map((p) => {
            const id = String(p._id);
            return (
              <li key={id}>
                <Link
                  href={`/dashboard/nutrition/${id}`}
                  className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-white/20 hover:bg-white/[0.05] transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-white truncate group-hover:text-fuchsia-300 transition">
                      {p.name}
                    </h3>
                    <span className="shrink-0 text-xs text-white/40">
                      {p.meals.length} meal{p.meals.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-white/70">
                    {p.targets.calories} kcal ·{" "}
                    <span className="text-white/50">
                      {p.targets.protein}P / {p.targets.carbs}C / {p.targets.fat}F
                    </span>
                  </p>
                  <div className="mt-4 pt-3 border-t border-white/5 text-xs text-fuchsia-300/80 group-hover:text-fuchsia-300 transition">
                    Open →
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
