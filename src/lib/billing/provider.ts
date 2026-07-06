import type { BillingCycle, Tier } from "./plans";

export type CheckoutInput = {
  userId: string;
  tier: Tier;
  cycle: BillingCycle;
  origin: string;
};

export interface BillingProvider {
  name: "mock" | "lemonsqueezy" | "stripe";
  createCheckout(input: CheckoutInput): Promise<{ url: string }>;
}

const lemonConfigured = Boolean(
  process.env.LEMONSQUEEZY_API_KEY && process.env.LEMONSQUEEZY_STORE_ID
);

/**
 * Mock provider — no external account needed. "Checkout" sends the trainer to
 * an internal success page that activates their subscription, simulating a
 * completed payment. Swap `createCheckout` for a real hosted-checkout URL
 * (LemonSqueezy / Stripe) and add a webhook to flip status to active.
 */
const mockProvider: BillingProvider = {
  name: "mock",
  async createCheckout({ tier, cycle, origin }) {
    const url = `${origin}/dashboard/billing/success?tier=${tier}&cycle=${cycle}`;
    return { url };
  },
};

// When real keys are present, use LemonSqueezy (merchant-of-record — works for
// Pakistan-based sellers). Otherwise fall back to the zero-config mock.
export function getBillingProvider(): BillingProvider {
  if (lemonConfigured) {
    // Imported lazily so the mock path never pulls in the LS module.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { lemonSqueezyProvider } = require("./lemonsqueezy") as typeof import("./lemonsqueezy");
    return lemonSqueezyProvider;
  }
  return mockProvider;
}

export const billingMode: "live" | "mock" = lemonConfigured ? "live" : "mock";
