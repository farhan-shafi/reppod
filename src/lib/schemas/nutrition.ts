import { z } from "zod";
import type { Macros } from "@/lib/foods";

export const macrosSchema = z.object({
  calories: z.number().min(0).max(20000),
  protein: z.number().min(0).max(2000),
  carbs: z.number().min(0).max(2000),
  fat: z.number().min(0).max(2000),
});

/** A single food entry — used both in meal-plan meals and in client food logs. */
export const mealItemSchema = z.object({
  foodId: z.string().optional(),
  name: z.string().trim().min(1, "Food name required").max(120),
  qtyGrams: z.number().min(1).max(5000),
  calories: z.number().min(0).max(20000),
  protein: z.number().min(0).max(2000),
  carbs: z.number().min(0).max(2000),
  fat: z.number().min(0).max(2000),
});

export const mealSchema = z.object({
  title: z.string().trim().min(1).max(60),
  items: z.array(mealItemSchema).min(1, "Add at least one food"),
});

export const mealPlanCreateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  targets: macrosSchema,
  meals: z.array(mealSchema).min(1, "Add at least one meal"),
});

export const mealPlanUpdateSchema = mealPlanCreateSchema.partial();

export const assignMealPlanSchema = z.object({
  mealPlanId: z.string().min(1, "Meal plan required"),
});

export const foodLogCreateSchema = z.object({
  mealPlanId: z.string().optional(),
  date: z.string().optional(),
  entries: z.array(mealItemSchema).min(1, "Log at least one food"),
});

export type MealItemInput = z.infer<typeof mealItemSchema>;
export type MealInput = z.infer<typeof mealSchema>;
export type MealPlanCreateInput = z.infer<typeof mealPlanCreateSchema>;
export type FoodLogCreateInput = z.infer<typeof foodLogCreateSchema>;

/** Sum macros across a list of items (meal items or log entries). */
export function computeMacros(items: { calories: number; protein: number; carbs: number; fat: number }[]): Macros {
  return items.reduce<Macros>(
    (sum, i) => ({
      calories: sum.calories + i.calories,
      protein: sum.protein + i.protein,
      carbs: sum.carbs + i.carbs,
      fat: sum.fat + i.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export type SerializedMealItem = MealItemInput;

export type SerializedMealPlan = {
  id: string;
  trainer: string;
  name: string;
  description?: string;
  targets: Macros;
  meals: { title: string; items: SerializedMealItem[] }[];
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type SerializedMealPlanAssignment = {
  id: string;
  client: string;
  mealPlan: { id: string; name: string; targets: Macros; mealCount: number };
  assignedAt: string | Date;
  status: "active" | "archived";
};

export type SerializedFoodLog = {
  id: string;
  client: string;
  date: string | Date;
  entries: SerializedMealItem[];
  totals: Macros;
};
