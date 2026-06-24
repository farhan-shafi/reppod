import { z } from "zod";

export const assignWorkoutSchema = z.object({
  workoutId: z.string().min(1, "Workout required"),
});

export const setLogSchema = z.object({
  reps: z.number().int().min(0).max(500),
  weight: z.number().min(0).max(2000),
});

export const sessionBlockSchema = z.object({
  exerciseId: z.string().min(1),
  sets: z.array(setLogSchema).min(1, "Log at least one set"),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const sessionCreateSchema = z.object({
  workoutId: z.string().optional(),
  performedAt: z.string().optional(),
  blocks: z.array(sessionBlockSchema).min(1, "Log at least one exercise"),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export const messageCreateSchema = z.object({
  body: z.string().trim().min(1, "Write something").max(2000),
});

export type SetLogInput = z.infer<typeof setLogSchema>;
export type SessionBlockInput = z.infer<typeof sessionBlockSchema>;
export type SessionCreateInput = z.infer<typeof sessionCreateSchema>;
export type MessageCreateInput = z.infer<typeof messageCreateSchema>;

export type SerializedAssignment = {
  id: string;
  client: string;
  workout: {
    id: string;
    name: string;
    blockCount: number;
  };
  assignedAt: string | Date;
  status: "active" | "archived";
};

export type SerializedSession = {
  id: string;
  client: string;
  workout?: { id: string; name: string };
  performedAt: string | Date;
  blocks: SessionBlockInput[];
  notes?: string;
  totalVolume: number;
};

export type SerializedMessage = {
  id: string;
  senderRole: "trainer" | "client";
  body: string;
  createdAt: string | Date;
};
