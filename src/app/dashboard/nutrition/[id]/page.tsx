import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { requireTrainer } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/mongoose";
import { MealPlan } from "@/models/MealPlan";
import type { SerializedMealPlan } from "@/lib/schemas/nutrition";
import MealPlanDetailView from "./MealPlanDetailView";

type Params = { params: Promise<{ id: string }> };

export const metadata = { title: "Meal plan · FlexFlow" };

export default async function MealPlanDetailPage({ params }: Params) {
  const { id } = await params;
  const user = await requireTrainer();

  if (!Types.ObjectId.isValid(id)) notFound();

  await connectDB();
  const doc = await MealPlan.findOne({ _id: id, trainer: user.id }).lean();
  if (!doc) notFound();

  const { _id, trainer, ...rest } = doc;
  const mealPlan: SerializedMealPlan = {
    id: String(_id),
    trainer: String(trainer),
    ...(rest as Omit<SerializedMealPlan, "id" | "trainer">),
  };

  return <MealPlanDetailView mealPlan={mealPlan} />;
}
