import mongoose, { Schema, Types, type Model } from "mongoose";

export interface IMealPlanAssignment {
  trainer: Types.ObjectId;
  client: Types.ObjectId;
  mealPlan: Types.ObjectId;
  assignedAt: Date;
  status: "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const MealPlanAssignmentSchema = new Schema<IMealPlanAssignment>(
  {
    trainer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    client: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    mealPlan: { type: Schema.Types.ObjectId, ref: "MealPlan", required: true },
    assignedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  { timestamps: true }
);

MealPlanAssignmentSchema.index({ client: 1, mealPlan: 1 }, { unique: true });

export const MealPlanAssignment: Model<IMealPlanAssignment> =
  mongoose.models.MealPlanAssignment ||
  mongoose.model<IMealPlanAssignment>("MealPlanAssignment", MealPlanAssignmentSchema);
