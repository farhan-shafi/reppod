import crypto from "crypto";
import type { BillingProvider, CheckoutInput } from "./provider";
import type { BillingCycle, Tier } from "./plans";
import type { SubStatus } from "@/models/Subscription";

/**
 * Dodo Payments provider (Merchant of Record; works for Pakistan-based sellers,
 * auto-localizes currency for international buyers).
 *
 * NOTE: verify exact field names against the current Dodo docs when you add
 * keys — this is gated behind DODO_API_KEY, so the app runs on mock until then.
 */

function apiKey() {
  return process.env.DODO_API_KEY ?? "";
}
function baseUrl() {
  return process.env.DODO_MODE === "live"
    ? "https://live.dodopayments.com"
    : "https://test.dodopayments.com";
}

/** Env var for a plan+cycle product, e.g. DODO_PRODUCT_PRO_MONTHLY. */
function productEnv(tier: Tier, cycle: BillingCycle) {
  return `DODO_PRODUCT_${tier.toUpperCase()}_${cycle.toUpperCase()}`;
}
export function productIdFor(tier: Tier, cycle: BillingCycle): string | undefined {
  return process.env[productEnv(tier, cycle)];
}
export function tierForProduct(productId: string): { tier: Tier; cycle: BillingCycle } | null {
  const tiers: Tier[] = ["starter", "pro", "studio"];
  const cycles: BillingCycle[] = ["monthly", "yearly"];
  for (const tier of tiers) {
    for (const cycle of cycles) {
      if (productIdFor(tier, cycle) === productId) return { tier, cycle };
    }
  }
  return null;
}

export function mapDodoStatus(status: string): SubStatus {
  switch (status) {
    case "on_trial":
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "cancelled":
    case "canceled":
    case "expired":
      return "canceled";
    default:
      return "active";
  }
}

/**
 * Verify a Standard-Webhooks signature (the scheme Dodo uses).
 * Headers: webhook-id, webhook-timestamp, webhook-signature ("v1,<base64>").
 */
export function verifyDodoWebhook(
  rawBody: string,
  headers: { id: string | null; timestamp: string | null; signature: string | null }
): boolean {
  const secretRaw = process.env.DODO_WEBHOOK_SECRET ?? "";
  if (!secretRaw || !headers.id || !headers.timestamp || !headers.signature) return false;

  const secretBytes = Buffer.from(secretRaw.replace(/^whsec_/, ""), "base64");
  const signedContent = `${headers.id}.${headers.timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac("sha256", secretBytes)
    .update(signedContent)
    .digest("base64");

  // The header may contain multiple space-separated "v1,<sig>" entries.
  return headers.signature.split(" ").some((part) => {
    const sig = part.includes(",") ? part.split(",")[1] : part;
    try {
      return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    } catch {
      return false;
    }
  });
}

export const dodoProvider: BillingProvider = {
  name: "dodo",
  async createCheckout({ userId, tier, cycle, origin }: CheckoutInput): Promise<{ url: string }> {
    const productId = productIdFor(tier, cycle);
    if (!productId) {
      throw new Error(`Missing ${productEnv(tier, cycle)} — configure your Dodo product IDs.`);
    }

    const res = await fetch(`${baseUrl()}/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: 1,
        payment_link: true,
        return_url: `${origin}/dashboard/billing?success=1`,
        metadata: { user_id: userId },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Dodo checkout failed (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    const url = json?.payment_link ?? json?.checkout_url ?? json?.url;
    if (!url) throw new Error("Dodo did not return a payment link.");
    return { url };
  },
};
