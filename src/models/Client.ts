import mongoose, { Schema, Types, type Model } from "mongoose";
import {
  CLIENT_GOALS,
  CLIENT_STATUSES,
  type ClientGoal,
  type ClientStatus,
} from "@/lib/schemas/client";

export type InviteStatus = "pending" | "accepted";

export interface IClient {
  trainer: Types.ObjectId;
  user?: Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  goal: ClientGoal;
  status: ClientStatus;
  startDate: Date;
  notes?: string;
  avatar?: string;
  inviteToken?: string;
  inviteStatus: InviteStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    trainer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    goal: { type: String, enum: CLIENT_GOALS, default: "general_fitness" },
    status: { type: String, enum: CLIENT_STATUSES, default: "active", index: true },
    startDate: { type: Date, default: Date.now },
    notes: { type: String },
    avatar: { type: String },
    inviteToken: { type: String, index: true, sparse: true },
    inviteStatus: { type: String, enum: ["pending", "accepted"], default: "pending" },
  },
  { timestamps: true }
);

export const Client: Model<IClient> =
  mongoose.models.Client || mongoose.model<IClient>("Client", ClientSchema);
