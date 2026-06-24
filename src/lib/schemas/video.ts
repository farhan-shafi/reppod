import { z } from "zod";

export const COMPLETION_THRESHOLD = 0.9;

export const videoProgressSchema = z.object({
  workoutId: z.string().min(1),
  exerciseId: z.string().min(1),
  watchedSeconds: z.number().min(0).max(100000),
  duration: z.number().min(0).max(100000),
});

export type VideoProgressInput = z.infer<typeof videoProgressSchema>;

export type SerializedVideoProgress = {
  workoutId: string;
  exerciseId: string;
  watchedSeconds: number;
  duration: number;
  percent: number;
  completed: boolean;
};
