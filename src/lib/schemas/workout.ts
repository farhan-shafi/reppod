import { z } from "zod";

export const workoutBlockSchema = z.object({
  exerciseId: z.string().min(1, "Exercise required"),
  sets: z.number().int().min(1).max(20).default(3),
  reps: z.string().trim().max(20).default("8-12"),
  restSec: z.number().int().min(0).max(600).default(60),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),
  videoDuration: z.number().min(0).optional(),
});

export const workoutCreateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  blocks: z.array(workoutBlockSchema).min(1, "Add at least one exercise"),
});

export const workoutUpdateSchema = workoutCreateSchema.partial();

export type WorkoutBlockInput = z.infer<typeof workoutBlockSchema>;
export type WorkoutCreateInput = z.infer<typeof workoutCreateSchema>;
export type WorkoutUpdateInput = z.infer<typeof workoutUpdateSchema>;

export type SerializedWorkoutBlock = WorkoutBlockInput;

export type SerializedWorkout = {
  id: string;
  trainer: string;
  name: string;
  description?: string;
  blocks: SerializedWorkoutBlock[];
  createdAt: string | Date;
  updatedAt: string | Date;
};
