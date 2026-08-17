import { connectDB } from "@/lib/mongoose";
import { RateLimit } from "@/models/RateLimit";

export type RateLimitResult = {
  allowed: boolean;
  retryAfter: number;
};

/** Database-backed fixed-window limiter that works across serverless instances. */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  await connectDB();

  const now = new Date();
  const active = await RateLimit.findOneAndUpdate(
    { key, resetAt: { $gt: now } },
    { $inc: { count: 1 } },
    { new: true }
  ).lean();

  if (active) {
    return {
      allowed: active.count <= limit,
      retryAfter: Math.max(
        1,
        Math.ceil((active.resetAt.getTime() - now.getTime()) / 1000)
      ),
    };
  }

  const resetAt = new Date(now.getTime() + windowMs);
  try {
    await RateLimit.findOneAndUpdate(
      { key },
      { $set: { count: 1, resetAt } },
      { upsert: true, new: true }
    );
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return checkRateLimit(key, limit, windowMs);
    }
    throw error;
  }

  return { allowed: true, retryAfter: Math.ceil(windowMs / 1000) };
}
