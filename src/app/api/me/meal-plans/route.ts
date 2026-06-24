import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireClientUser } from "@/lib/api-helpers";
import { MealPlanAssignment } from "@/models/MealPlanAssignment";
import { MealPlan } from "@/models/MealPlan";

export async function GET() {
  const result = await requireClientUser();
  if ("error" in result) return result.error;

  const docs = await MealPlanAssignment.find({ client: result.client._id })
    .populate<{
      mealPlan: {
        _id: Types.ObjectId;
        name: string;
        description?: string;
        targets: { calories: number; protein: number; carbs: number; fat: number };
        meals: { title: string; items: unknown[] }[];
      };
    }>({ path: "mealPlan", model: MealPlan, select: "name description targets meals" })
    .sort({ assignedAt: -1 })
    .lean();

  const mealPlans = docs
    .filter((d) => d.mealPlan)
    .map((d) => ({
      assignmentId: String(d._id),
      assignedAt: d.assignedAt,
      mealPlan: {
        id: String(d.mealPlan._id),
        name: d.mealPlan.name,
        description: d.mealPlan.description,
        targets: d.mealPlan.targets,
        meals: d.mealPlan.meals,
      },
    }));

  return NextResponse.json({ mealPlans });
}
