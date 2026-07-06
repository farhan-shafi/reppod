import crypto from "crypto";
import type { BillingProvider, CheckoutInput } from "./provider";
import type { BillingCycle, Tier } from "./plans";
import type { SubStatus } from "@/models/Subscription";

const API = "https://api.lemonsqueezy.com/v1";

function apiKey() {
  return process.env.LEMONSQUEEZY_API_KEY ?? "";
}
function storeId() {
  return process.env.LEMONSQUEEZY_STORE_ID ?? "";
}
export function webhookSecret() {
  return process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? "";
}

/** Env var name for a given tier+cycle variant, e.g. LEMONSQUEEZY_VARIANT_PRO_MONTHLY. */
function variantEnv(tier: Tier, cycle: BillingCycle) {
  return `LEMONSQUEEZY_VARIANT_${tier.toUpperCase()}_${cycle.toUpperCase()}`;
}

export function variantIdFor(tier: Tier, cycle: BillingCycle): string | undefined {
  return process.env[variantEnv(tier, cycle)];
}

/** Reverse lookup: which tier+cycle does this LemonSqueezy variant id map to? */
export function tierForVariant(variantId: string): { tier: Tier; cycle: BillingCycle } | null {
  const tiers: Tier[] = ["starter", "pro", "studio"];
  const cycles: BillingCycle[] = ["monthly", "yearly"];
  for (const tier of tiers) {
    for (const cycle of cycles) {
      if (variantIdFor(tier, cycle) === variantId) return { tier, cycle };
    }
  }
  return null;
}

/** Map a LemonSqueezy subscription status to our internal status. */
export function mapStatus(lsStatus: string): SubStatus {
  switch (lsStatus) {
    case "on_trial":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
    case "unpaid":
    case "paused":
      return "past_due";
    case "cancelled":
    case "expired":
      return "canceled";
    default:
      return "active";
  }
}

export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = webhookSecret();
  if (!secret || !signature) return false;
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

export const lemonSqueezyProvider: BillingProvider = {
  name: "lemonsqueezy",
  async createCheckout({ userId, tier, cycle, origin }: CheckoutInput): Promise<{ url: string }> {
    const variantId = variantIdFor(tier, cycle);
    if (!variantId) {
      throw new Error(`Missing ${variantEnv(tier, cycle)} — configure your LemonSqueezy variant IDs.`);
    }

    const res = await fetch(`${API}/checkouts`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${apiKey()}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: { custom: { user_id: userId } },
            product_options: {
              redirect_url: `${origin}/dashboard/billing?success=1`,
            },
          },
          relationships: {
            store: { data: { type: "stores", id: String(storeId()) } },
            variant: { data: { type: "variants", id: String(variantId) } },
          },
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`LemonSqueezy checkout failed (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    const url = json?.data?.attributes?.url;
    if (!url) throw new Error("LemonSqueezy did not return a checkout URL.");
    return { url };
  },
};
