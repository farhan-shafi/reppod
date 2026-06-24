import mongoose, { Schema, Types, type Model } from "mongoose";

export interface IWorkoutAssignment {
  trainer: Types.ObjectId;
  client: Types.ObjectId;
  workout: Types.ObjectId;
  assignedAt: Date;
  status: "active" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutAssignmentSchema = new Schema<IWorkoutAssignment>(
  {
    trainer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    client: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    workout: { type: Schema.Types.ObjectId, ref: "Workout", required: true },
    assignedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["active", "archived"], default: "active" },
  },
  { timestamps: true }
);

WorkoutAssignmentSchema.index({ client: 1, workout: 1 }, { unique: true });

export const WorkoutAssignment: Model<IWorkoutAssignment> =
  mongoose.models.WorkoutAssignment ||
  mongoose.model<IWorkoutAssignment>("WorkoutAssignment", WorkoutAssignmentSchema);
