import { z } from "zod";

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
  bio: z.string().max(500).optional().or(z.literal("")),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  unitPreference: z.enum(["kg", "lb"]).optional(),
  businessName: z.string().trim().max(120).optional().or(z.literal("")),
});

export const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type PasswordUpdateInput = z.infer<typeof passwordUpdateSchema>;
