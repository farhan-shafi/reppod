import mongoose, { Schema, Types, type Model } from "mongoose";

export interface IWorkoutBlock {
  exerciseId: string;
  sets: number;
  reps: string;
  restSec: number;
  notes?: string;
  videoUrl?: string;
  videoDuration?: number;
}

export interface IWorkout {
  trainer: Types.ObjectId;
  name: string;
  description?: string;
  blocks: IWorkoutBlock[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutBlockSchema = new Schema<IWorkoutBlock>(
  {
    exerciseId: { type: String, required: true },
    sets: { type: Number, default: 3 },
    reps: { type: String, default: "8-12" },
    restSec: { type: Number, default: 60 },
    notes: { type: String },
    videoUrl: { type: String },
    videoDuration: { type: Number },
  },
  { _id: false }
);

const WorkoutSchema = new Schema<IWorkout>(
  {
    trainer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    blocks: { type: [WorkoutBlockSchema], default: [] },
  },
  { timestamps: true }
);

export const Workout: Model<IWorkout> =
  mongoose.models.Workout || mongoose.model<IWorkout>("Workout", WorkoutSchema);
