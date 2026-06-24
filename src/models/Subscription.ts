import mongoose, { Schema, Types, type Model } from "mongoose";

export type SubStatus = "trialing" | "active" | "canceled" | "past_due";

export interface ISubscription {
  user: Types.ObjectId;
  tier: "starter" | "pro" | "studio";
  status: SubStatus;
  cycle: "monthly" | "yearly";
  trialEndsAt?: Date;
  currentPeriodEnd?: Date;
  provider: "mock" | "lemonsqueezy" | "stripe";
  externalId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    tier: { type: String, enum: ["starter", "pro", "studio"], default: "pro" },
    status: {
      type: String,
      enum: ["trialing", "active", "canceled", "past_due"],
      default: "trialing",
    },
    cycle: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
    trialEndsAt: { type: Date },
    currentPeriodEnd: { type: Date },
    provider: { type: String, enum: ["mock", "lemonsqueezy", "stripe"], default: "mock" },
    externalId: { type: String },
  },
  { timestamps: true }
);

export const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
