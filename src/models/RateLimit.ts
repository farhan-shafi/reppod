import mongoose, { Schema, type Model } from "mongoose";

interface IRateLimit {
  key: string;
  count: number;
  resetAt: Date;
}

const RateLimitSchema = new Schema<IRateLimit>({
  key: { type: String, required: true, unique: true },
  count: { type: Number, required: true, default: 0 },
  resetAt: { type: Date, required: true, index: { expires: 0 } },
});

export const RateLimit: Model<IRateLimit> =
  mongoose.models.RateLimit ||
  mongoose.model<IRateLimit>("RateLimit", RateLimitSchema);
