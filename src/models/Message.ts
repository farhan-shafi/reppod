import mongoose, { Schema, Types, type Model } from "mongoose";

export type SenderRole = "trainer" | "client";

export interface IMessage {
  trainer: Types.ObjectId;
  client: Types.ObjectId;
  sender: Types.ObjectId;
  senderRole: SenderRole;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    trainer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    client: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["trainer", "client"], required: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
