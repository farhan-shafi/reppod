import { Types } from "mongoose";
import { Utensils } from "lucide-react";

import { requireClient } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/mongoose";
import { MealPlanAssignment } from "@/models/MealPlanAssignment";
import { MealPlan } from "@/models/MealPlan";
import { FoodLog } from "@/models/FoodLog";
import { computeMacros, type SerializedFoodLog } from "@/lib/schemas/nutrition";
import ClientNutritionView from "@/components/client-portal/ClientNutritionView";

export const metadata = { title: "Nutrition · Reppod" };

export default async function ClientNutritionPage() {
  const { client } = await requireClient();
  await connectDB();

  const [assignmentDocs, logDocs] = await Promise.all([
    MealPlanAssignment.find({ client: client._id })
      .populate<{
        mealPlan: {
          _id: Types.ObjectId;
          name: string;
          description?: string;
          targets: { calories: number; protein: number; carbs: number; fat: number };
          meals: { title: string; items: { name: string; qtyGrams: number; calories: number; protein: number; carbs: number; fat: number }[] }[];
        };
      }>({ path: "mealPlan", model: MealPlan, select: "name description targets meals" })
      .sort({ assignedAt: -1 })
      .lean(),
    FoodLog.find({ client: client._id }).sort({ date: -1 }).limit(14).lean(),
  ]);

  const plan = assignmentDocs.find((a) => a.mealPlan)?.mealPlan;
  const logs: SerializedFoodLog[] = logDocs.map((l) => ({
    id: String(l._id),
    client: String(l.client),
    date: l.date,
    entries: l.entries,
    totals: computeMacros(l.entries),
  }));

  if (!plan) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Nutrition</h1>
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
          <Utensils className="mx-auto size-6 text-white/40" />
          <p className="mt-3 text-sm text-white/60">
            Your coach hasn&apos;t assigned a meal plan yet. You can still log food below
            once one is set up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClientNutritionView
      plan={{
        id: String(plan._id),
        name: plan.name,
        description: plan.description,
        targets: plan.targets,
        meals: plan.meals,
      }}
      initialLogs={logs}
    />
  );
}
