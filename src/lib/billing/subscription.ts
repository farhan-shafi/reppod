import { connectDB } from "@/lib/mongoose";
import { Subscription, type ISubscription } from "@/models/Subscription";
import { PLANS, type PlanLimits, type Tier } from "./plans";

const TRIAL_DAYS = 14;

export type SubscriptionInfo = {
  tier: Tier;
  status: ISubscription["status"];
  cycle: ISubscription["cycle"];
  trialEndsAt?: Date;
  currentPeriodEnd?: Date;
  trialDaysLeft: number;
  limits: PlanLimits;
};

/**
 * Returns the trainer's subscription, creating a 14-day Pro trial on first
 * access (so existing accounts are grandfathered into a trial).
 */
export async function getOrCreateSubscription(
  userId: string
): Promise<SubscriptionInfo> {
  await connectDB();
  let sub = await Subscription.findOne({ user: userId });

  if (!sub) {
    sub = await Subscription.create({
      user: userId,
      tier: "pro",
      status: "trialing",
      cycle: "monthly",
      provider: "mock",
      trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
    });
  }

  return toInfo(sub);
}

export function toInfo(sub: ISubscription): SubscriptionInfo {
  const trialDaysLeft =
    sub.status === "trialing" && sub.trialEndsAt
      ? Math.max(
          0,
          Math.ceil((new Date(sub.trialEndsAt).getTime() - Date.now()) / 86400000)
        )
      : 0;

  return {
    tier: sub.tier,
    status: sub.status,
    cycle: sub.cycle,
    trialEndsAt: sub.trialEndsAt,
    currentPeriodEnd: sub.currentPeriodEnd,
    trialDaysLeft,
    limits: PLANS[sub.tier].limits,
  };
}

/** Convenience: just the entitlements for the trainer's current tier. */
export async function getLimits(userId: string): Promise<PlanLimits> {
  const info = await getOrCreateSubscription(userId);
  return info.limits;
}
