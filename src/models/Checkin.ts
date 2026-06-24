import mongoose, { Schema, Types, type Model } from "mongoose";

export interface ICheckinPhoto {
  url: string;
  pose: "front" | "side" | "back" | "other";
}

export interface ICheckin {
  trainer: Types.ObjectId;
  client: Types.ObjectId;
  date: Date;
  weightKg?: number;
  measurements?: {
    waist?: number;
    chest?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  energy?: number;
  sleep?: number;
  mood?: number;
  adherence?: number;
  note?: string;
  photos: ICheckinPhoto[];
  createdAt: Date;
  updatedAt: Date;
}

const CheckinPhotoSchema = new Schema<ICheckinPhoto>(
  {
    url: { type: String, required: true },
    pose: { type: String, enum: ["front", "side", "back", "other"], default: "front" },
  },
  { _id: false }
);

const CheckinSchema = new Schema<ICheckin>(
  {
    trainer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    client: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    date: { type: Date, default: Date.now, index: true },
    weightKg: { type: Number },
    measurements: {
      waist: Number,
      chest: Number,
      hips: Number,
      arms: Number,
      thighs: Number,
    },
    energy: { type: Number, min: 1, max: 5 },
    sleep: { type: Number, min: 1, max: 5 },
    mood: { type: Number, min: 1, max: 5 },
    adherence: { type: Number, min: 1, max: 5 },
    note: { type: String },
    photos: { type: [CheckinPhotoSchema], default: [] },
  },
  { timestamps: true }
);

export const Checkin: Model<ICheckin> =
  mongoose.models.Checkin || mongoose.model<ICheckin>("Checkin", CheckinSchema);
