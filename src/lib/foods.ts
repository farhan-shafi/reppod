export const FOOD_CATEGORIES = [
  "protein",
  "carb",
  "veg",
  "fruit",
  "dairy",
  "fat",
  "snack",
] as const;
export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  protein: "Protein",
  carb: "Carbs",
  veg: "Vegetables",
  fruit: "Fruit",
  dairy: "Dairy",
  fat: "Fats",
  snack: "Snacks",
};

export type Macros = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Food = {
  id: string;
  name: string;
  category: FoodCategory;
  /** Macros per 100 g. */
  per100: Macros;
};

// Common foods with per-100g macros (approximate, cooked where relevant).
export const FOODS: Food[] = [
  // Protein
  { id: "chicken-breast", name: "Chicken breast", category: "protein", per100: { calories: 165, protein: 31, carbs: 0, fat: 3.6 } },
  { id: "lean-beef", name: "Lean beef mince", category: "protein", per100: { calories: 217, protein: 26, carbs: 0, fat: 12 } },
  { id: "salmon", name: "Salmon", category: "protein", per100: { calories: 208, protein: 20, carbs: 0, fat: 13 } },
  { id: "tuna", name: "Tuna (canned in water)", category: "protein", per100: { calories: 116, protein: 26, carbs: 0, fat: 1 } },
  { id: "eggs", name: "Whole eggs", category: "protein", per100: { calories: 143, protein: 13, carbs: 1.1, fat: 9.5 } },
  { id: "egg-whites", name: "Egg whites", category: "protein", per100: { calories: 52, protein: 11, carbs: 0.7, fat: 0.2 } },
  { id: "tofu", name: "Firm tofu", category: "protein", per100: { calories: 144, protein: 17, carbs: 3, fat: 9 } },
  { id: "shrimp", name: "Shrimp", category: "protein", per100: { calories: 99, protein: 24, carbs: 0.2, fat: 0.3 } },
  { id: "turkey-breast", name: "Turkey breast", category: "protein", per100: { calories: 135, protein: 30, carbs: 0, fat: 1 } },
  { id: "whey", name: "Whey protein", category: "protein", per100: { calories: 400, protein: 80, carbs: 8, fat: 6 } },

  // Carbs
  { id: "white-rice", name: "White rice (cooked)", category: "carb", per100: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 } },
  { id: "brown-rice", name: "Brown rice (cooked)", category: "carb", per100: { calories: 123, protein: 2.7, carbs: 26, fat: 1 } },
  { id: "oats", name: "Rolled oats (dry)", category: "carb", per100: { calories: 379, protein: 13, carbs: 67, fat: 7 } },
  { id: "potato", name: "Potato", category: "carb", per100: { calories: 87, protein: 1.9, carbs: 20, fat: 0.1 } },
  { id: "sweet-potato", name: "Sweet potato", category: "carb", per100: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 } },
  { id: "whole-wheat-bread", name: "Whole-wheat bread", category: "carb", per100: { calories: 247, protein: 13, carbs: 41, fat: 3.4 } },
  { id: "pasta", name: "Pasta (cooked)", category: "carb", per100: { calories: 158, protein: 6, carbs: 31, fat: 0.9 } },
  { id: "quinoa", name: "Quinoa (cooked)", category: "carb", per100: { calories: 120, protein: 4.4, carbs: 21, fat: 1.9 } },
  { id: "roti", name: "Roti / chapati", category: "carb", per100: { calories: 297, protein: 11, carbs: 46, fat: 7 } },

  // Vegetables
  { id: "broccoli", name: "Broccoli", category: "veg", per100: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 } },
  { id: "spinach", name: "Spinach", category: "veg", per100: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 } },
  { id: "mixed-veg", name: "Mixed vegetables", category: "veg", per100: { calories: 65, protein: 2.6, carbs: 13, fat: 0.5 } },
  { id: "bell-pepper", name: "Bell pepper", category: "veg", per100: { calories: 31, protein: 1, carbs: 6, fat: 0.3 } },

  // Fruit
  { id: "banana", name: "Banana", category: "fruit", per100: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 } },
  { id: "apple", name: "Apple", category: "fruit", per100: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 } },
  { id: "blueberries", name: "Blueberries", category: "fruit", per100: { calories: 57, protein: 0.7, carbs: 14, fat: 0.3 } },
  { id: "dates", name: "Dates", category: "fruit", per100: { calories: 277, protein: 1.8, carbs: 75, fat: 0.2 } },

  // Dairy
  { id: "greek-yogurt", name: "Greek yogurt (0%)", category: "dairy", per100: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 } },
  { id: "milk", name: "Milk (2%)", category: "dairy", per100: { calories: 50, protein: 3.4, carbs: 5, fat: 2 } },
  { id: "cottage-cheese", name: "Cottage cheese", category: "dairy", per100: { calories: 98, protein: 11, carbs: 3.4, fat: 4.3 } },
  { id: "cheddar", name: "Cheddar cheese", category: "dairy", per100: { calories: 403, protein: 25, carbs: 1.3, fat: 33 } },

  // Fats
  { id: "almonds", name: "Almonds", category: "fat", per100: { calories: 579, protein: 21, carbs: 22, fat: 50 } },
  { id: "peanut-butter", name: "Peanut butter", category: "fat", per100: { calories: 588, protein: 25, carbs: 20, fat: 50 } },
  { id: "olive-oil", name: "Olive oil", category: "fat", per100: { calories: 884, protein: 0, carbs: 0, fat: 100 } },
  { id: "avocado", name: "Avocado", category: "fat", per100: { calories: 160, protein: 2, carbs: 9, fat: 15 } },

  // Snacks
  { id: "protein-bar", name: "Protein bar", category: "snack", per100: { calories: 350, protein: 30, carbs: 35, fat: 10 } },
  { id: "rice-cakes", name: "Rice cakes", category: "snack", per100: { calories: 387, protein: 8, carbs: 82, fat: 2.8 } },
  { id: "dark-chocolate", name: "Dark chocolate (85%)", category: "snack", per100: { calories: 600, protein: 8, carbs: 33, fat: 48 } },
];

const byId = new Map(FOODS.map((f) => [f.id, f]));
export function getFood(id: string): Food | undefined {
  return byId.get(id);
}

/** Scale a food's per-100g macros to a given gram quantity, rounded. */
export function macrosForQty(per100: Macros, qtyGrams: number): Macros {
  const k = qtyGrams / 100;
  return {
    calories: Math.round(per100.calories * k),
    protein: Math.round(per100.protein * k),
    carbs: Math.round(per100.carbs * k),
    fat: Math.round(per100.fat * k),
  };
}
