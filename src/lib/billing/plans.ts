export type Tier = "starter" | "pro" | "studio";
export type BillingCycle = "monthly" | "yearly";

export const TIERS: Tier[] = ["starter", "pro", "studio"];

export type PlanLimits = {
  /** Use Infinity for unlimited. */
  maxClients: number;
  nutrition: boolean;
  aiGeneration: boolean;
  multiTrainer: boolean;
};

export type Plan = {
  tier: Tier;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  limits: PlanLimits;
  popular?: boolean;
};

export const PLANS: Record<Tier, Plan> = {
  starter: {
    tier: "starter",
    name: "Starter",
    tagline: "For trainers just getting started.",
    priceMonthly: 19,
    priceYearly: 15,
    features: [
      "Up to 10 clients",
      "Workout builder",
      "Progress & check-ins",
      "Email support",
    ],
    limits: { maxClients: 10, nutrition: false, aiGeneration: false, multiTrainer: false },
  },
  pro: {
    tier: "pro",
    name: "Pro",
    tagline: "Everything you need to scale.",
    priceMonthly: 49,
    priceYearly: 39,
    popular: true,
    features: [
      "Unlimited clients",
      "Nutrition & meal plans",
      "Demo videos & engagement",
      "In-app messaging",
      "Priority support",
    ],
    limits: {
      maxClients: Number.POSITIVE_INFINITY,
      nutrition: true,
      aiGeneration: true,
      multiTrainer: false,
    },
  },
  studio: {
    tier: "studio",
    name: "Studio",
    tagline: "For teams and growing studios.",
    priceMonthly: 99,
    priceYearly: 79,
    features: [
      "Everything in Pro",
      "Multi-trainer workspace",
      "Custom branding",
      "Dedicated support",
    ],
    limits: {
      maxClients: Number.POSITIVE_INFINITY,
      nutrition: true,
      aiGeneration: true,
      multiTrainer: true,
    },
  },
};

export function getPlan(tier: Tier): Plan {
  return PLANS[tier];
}

export function planLimits(tier: Tier): PlanLimits {
  return PLANS[tier].limits;
}

export function priceFor(tier: Tier, cycle: BillingCycle): number {
  return cycle === "yearly" ? PLANS[tier].priceYearly : PLANS[tier].priceMonthly;
}
