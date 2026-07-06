import type { BillingCycle, Tier } from "./plans";

export type CheckoutInput = {
  userId: string;
  tier: Tier;
  cycle: BillingCycle;
  origin: string;
};

export interface BillingProvider {
  name: "mock" | "dodo" | "lemonsqueezy" | "stripe";
  createCheckout(input: CheckoutInput): Promise<{ url: string }>;
}

const dodoConfigured = Boolean(process.env.DODO_API_KEY);
const lemonConfigured = Boolean(
  process.env.LEMONSQUEEZY_API_KEY && process.env.LEMONSQUEEZY_STORE_ID
);

/**
 * Mock provider — no external account needed. "Checkout" sends the trainer to
 * an internal success page that activates their subscription, simulating a
 * completed payment.
 */
const mockProvider: BillingProvider = {
  name: "mock",
  async createCheckout({ tier, cycle, origin }) {
    const url = `${origin}/dashboard/billing/success?tier=${tier}&cycle=${cycle}`;
    return { url };
  },
};

/** Which provider is active — Dodo → LemonSqueezy → mock, based on env keys. */
export const billingProviderName: BillingProvider["name"] = dodoConfigured
  ? "dodo"
  : lemonConfigured
  ? "lemonsqueezy"
  : "mock";

export function getBillingProvider(): BillingProvider {
  if (dodoConfigured) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { dodoProvider } = require("./dodo") as typeof import("./dodo");
    return dodoProvider;
  }
  if (lemonConfigured) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { lemonSqueezyProvider } = require("./lemonsqueezy") as typeof import("./lemonsqueezy");
    return lemonSqueezyProvider;
  }
  return mockProvider;
}

export const billingMode: "live" | "mock" =
  dodoConfigured || lemonConfigured ? "live" : "mock";
