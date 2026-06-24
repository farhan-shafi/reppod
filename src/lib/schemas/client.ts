import { z } from "zod";

export const CLIENT_GOALS = [
  "weight_loss",
  "muscle_gain",
  "endurance",
  "general_fitness",
  "other",
] as const;
export type ClientGoal = (typeof CLIENT_GOALS)[number];

export const CLIENT_STATUSES = ["active", "paused", "archived"] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const GOAL_LABELS: Record<ClientGoal, string> = {
  weight_loss: "Weight loss",
  muscle_gain: "Muscle gain",
  endurance: "Endurance",
  general_fitness: "General fitness",
  other: "Other",
};

export const STATUS_LABELS: Record<ClientStatus, string> = {
  active: "Active",
  paused: "Paused",
  archived: "Archived",
};

export const clientCreateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  goal: z.enum(CLIENT_GOALS).default("general_fitness"),
  status: z.enum(CLIENT_STATUSES).default("active"),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const clientUpdateSchema = clientCreateSchema.partial();

export type ClientCreateInput = z.infer<typeof clientCreateSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;

export type SerializedClient = {
  id: string;
  trainer: string;
  user?: string;
  name: string;
  email?: string;
  phone?: string;
  goal: ClientGoal;
  status: ClientStatus;
  startDate: string | Date;
  notes?: string;
  avatar?: string;
  inviteToken?: string;
  inviteStatus: "pending" | "accepted";
  createdAt: string | Date;
  updatedAt: string | Date;
};
