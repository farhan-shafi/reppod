import mongoose, { Schema, Types, type Model } from "mongoose";

export type NotificationType =
  | "message"
  | "session_logged"
  | "workout_assigned"
  | "invite_accepted";

export interface INotification {
  user: Types.ObjectId;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["message", "session_logged", "workout_assigned", "invite_accepted"],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String },
    link: { type: String },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export async function createNotification(input: {
  user: Types.ObjectId | string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}) {
  try {
    await Notification.create(input);
  } catch (err) {
    // Notifications are best-effort; never block the main action.
    console.error("Failed to create notification:", err);
  }
}
