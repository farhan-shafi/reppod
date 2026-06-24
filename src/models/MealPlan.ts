import mongoose, { Schema, Types, type Model } from "mongoose";

export interface IMealItem {
  foodId?: string;
  name: string;
  qtyGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface IMeal {
  title: string;
  items: IMealItem[];
}

export interface IMealPlan {
  trainer: Types.ObjectId;
  name: string;
  description?: string;
  targets: { calories: number; protein: number; carbs: number; fat: number };
  meals: IMeal[];
  createdAt: Date;
  updatedAt: Date;
}

const MealItemSchema = new Schema<IMealItem>(
  {
    foodId: { type: String },
    name: { type: String, required: true },
    qtyGrams: { type: Number, required: true },
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
  },
  { _id: false }
);

const MealSchema = new Schema<IMeal>(
  {
    title: { type: String, required: true },
    items: { type: [MealItemSchema], default: [] },
  },
  { _id: false }
);

const MealPlanSchema = new Schema<IMealPlan>(
  {
    trainer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    targets: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
    },
    meals: { type: [MealSchema], default: [] },
  },
  { timestamps: true }
);

export const MealPlan: Model<IMealPlan> =
  mongoose.models.MealPlan || mongoose.model<IMealPlan>("MealPlan", MealPlanSchema);
