import mongoose, { Schema, type Model } from "mongoose";

export type UnitPreference = "kg" | "lb";

export interface IUser {
  name: string;
  email: string;
  passwordHash?: string;
  image?: string;
  bio?: string;
  role: "trainer" | "client";
  businessName?: string;
  unitPreference: UnitPreference;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, select: false },
    image: { type: String },
    bio: { type: String, maxlength: 500 },
    role: { type: String, enum: ["trainer", "client"], default: "trainer" },
    businessName: { type: String, trim: true },
    unitPreference: { type: String, enum: ["kg", "lb"], default: "kg" },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
