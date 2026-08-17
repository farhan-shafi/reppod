import { createHash } from "node:crypto";
import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 10;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email");

export const newPasswordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
  )
  .max(72, "Password must be 72 characters or fewer")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[0-9]/, "Password must include a number");

export function getClientAddress(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwarded ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function rateLimitKey(scope: string, identifier: string): string {
  return createHash("sha256")
    .update(`${scope}:${identifier.trim().toLowerCase()}`)
    .digest("hex");
}
