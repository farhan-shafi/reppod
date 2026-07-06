import { redirect } from "next/navigation";
import { requireTrainer } from "@/lib/auth-helpers";
import { getLimits } from "@/lib/billing/subscription";
import MealPlanBuilder from "@/components/nutrition/MealPlanBuilder";

export const metadata = { title: "New meal plan · Reppod" };

export default async function NewMealPlanPage() {
  const user = await requireTrainer();
  const limits = await getLimits(user.id);
  if (!limits.nutrition) redirect("/dashboard/nutrition");
  return <MealPlanBuilder />;
}
