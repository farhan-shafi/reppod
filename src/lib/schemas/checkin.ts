import { z } from "zod";

export const PHOTO_POSES = ["front", "side", "back", "other"] as const;
export type PhotoPose = (typeof PHOTO_POSES)[number];

export const POSE_LABELS: Record<PhotoPose, string> = {
  front: "Front",
  side: "Side",
  back: "Back",
  other: "Other",
};

export const RATING_FIELDS = ["energy", "sleep", "mood", "adherence"] as const;
export type RatingField = (typeof RATING_FIELDS)[number];

export const RATING_LABELS: Record<RatingField, string> = {
  energy: "Energy",
  sleep: "Sleep",
  mood: "Mood",
  adherence: "Adherence",
};

const rating = z.number().int().min(1).max(5).optional();

export const measurementsSchema = z
  .object({
    waist: z.number().min(0).max(500).optional(),
    chest: z.number().min(0).max(500).optional(),
    hips: z.number().min(0).max(500).optional(),
    arms: z.number().min(0).max(200).optional(),
    thighs: z.number().min(0).max(300).optional(),
  })
  .partial();

export const checkinPhotoSchema = z.object({
  url: z.string().url(),
  pose: z.enum(PHOTO_POSES),
});

export const checkinCreateSchema = z.object({
  date: z.string().optional(),
  weightKg: z.number().min(0).max(700).optional(),
  measurements: measurementsSchema.optional(),
  energy: rating,
  sleep: rating,
  mood: rating,
  adherence: rating,
  note: z.string().trim().max(1000).optional().or(z.literal("")),
  photos: z.array(checkinPhotoSchema).max(6).optional(),
});

export type CheckinCreateInput = z.infer<typeof checkinCreateSchema>;
export type CheckinPhoto = z.infer<typeof checkinPhotoSchema>;
export type Measurements = z.infer<typeof measurementsSchema>;

export type SerializedCheckin = {
  id: string;
  client: string;
  date: string | Date;
  weightKg?: number;
  measurements?: Measurements;
  energy?: number;
  sleep?: number;
  mood?: number;
  adherence?: number;
  note?: string;
  photos: CheckinPhoto[];
};
