import { requireTrainer } from "@/lib/auth-helpers";
import MealPlanBuilder from "@/components/nutrition/MealPlanBuilder";

export const metadata = { title: "New meal plan · Reppod" };

export default async function NewMealPlanPage() {
  await requireTrainer();
  return <MealPlanBuilder />;
}
