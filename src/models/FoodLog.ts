import mongoose, { Schema, Types, type Model } from "mongoose";

export interface IFoodEntry {
  foodId?: string;
  name: string;
  qtyGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface IFoodLog {
  trainer: Types.ObjectId;
  client: Types.ObjectId;
  mealPlan?: Types.ObjectId;
  date: Date;
  entries: IFoodEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const FoodEntrySchema = new Schema<IFoodEntry>(
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

const FoodLogSchema = new Schema<IFoodLog>(
  {
    trainer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    client: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    mealPlan: { type: Schema.Types.ObjectId, ref: "MealPlan" },
    date: { type: Date, default: Date.now, index: true },
    entries: { type: [FoodEntrySchema], default: [] },
  },
  { timestamps: true }
);

export const FoodLog: Model<IFoodLog> =
  mongoose.models.FoodLog || mongoose.model<IFoodLog>("FoodLog", FoodLogSchema);
