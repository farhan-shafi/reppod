import mongoose, { Schema, Types, type Model } from "mongoose";

export interface IVideoProgress {
  trainer: Types.ObjectId;
  client: Types.ObjectId;
  workout: Types.ObjectId;
  exerciseId: string;
  watchedSeconds: number;
  duration: number;
  percent: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VideoProgressSchema = new Schema<IVideoProgress>(
  {
    trainer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    client: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    workout: { type: Schema.Types.ObjectId, ref: "Workout", required: true },
    exerciseId: { type: String, required: true },
    watchedSeconds: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    percent: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One progress record per client per video (workout + exercise).
VideoProgressSchema.index(
  { client: 1, workout: 1, exerciseId: 1 },
  { unique: true }
);

export const VideoProgress: Model<IVideoProgress> =
  mongoose.models.VideoProgress ||
  mongoose.model<IVideoProgress>("VideoProgress", VideoProgressSchema);
