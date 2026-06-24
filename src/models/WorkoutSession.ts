import mongoose, { Schema, Types, type Model } from "mongoose";

export interface ISetLog {
  reps: number;
  weight: number;
}

export interface ISessionBlockLog {
  exerciseId: string;
  sets: ISetLog[];
  notes?: string;
}

export interface IWorkoutSession {
  trainer: Types.ObjectId;
  client: Types.ObjectId;
  workout?: Types.ObjectId;
  performedAt: Date;
  blocks: ISessionBlockLog[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SetLogSchema = new Schema<ISetLog>(
  {
    reps: { type: Number, required: true, min: 0 },
    weight: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const SessionBlockLogSchema = new Schema<ISessionBlockLog>(
  {
    exerciseId: { type: String, required: true },
    sets: { type: [SetLogSchema], default: [] },
    notes: { type: String },
  },
  { _id: false }
);

const WorkoutSessionSchema = new Schema<IWorkoutSession>(
  {
    trainer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    client: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    workout: { type: Schema.Types.ObjectId, ref: "Workout" },
    performedAt: { type: Date, default: Date.now, index: true },
    blocks: { type: [SessionBlockLogSchema], default: [] },
    notes: { type: String },
  },
  { timestamps: true }
);

export const WorkoutSession: Model<IWorkoutSession> =
  mongoose.models.WorkoutSession ||
  mongoose.model<IWorkoutSession>("WorkoutSession", WorkoutSessionSchema);
