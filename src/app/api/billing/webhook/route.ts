import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { Subscription } from "@/models/Subscription";
import { billingProviderName } from "@/lib/billing/provider";

/**
 * Payment-provider webhook. Verifies the signature for whichever provider is
 * active (Dodo or LemonSqueezy), then keeps the local Subscription in sync.
 * No-op in mock mode.
 */
export async function POST(request: Request) {
  const raw = await request.text();

  let userId: string | undefined;
  let tier: string | undefined;
  let cycle: string | undefined;
  let status: string | undefined;
  let externalId: string | undefined;
  let renewsAt: Date | undefined;
  let provider: "dodo" | "lemonsqueezy";

  if (billingProviderName === "dodo") {
    const {
      verifyDodoWebhook,
      tierForProduct,
      mapDodoStatus,
    } = await import("@/lib/billing/dodo");

    const ok = verifyDodoWebhook(raw, {
      id: request.headers.get("webhook-id"),
      timestamp: request.headers.get("webhook-timestamp"),
      signature: request.headers.get("webhook-signature"),
    });
    if (!ok) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

    const payload = safeParse(raw);
    if (!payload) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    const event = String(payload?.type ?? payload?.event_type ?? "");
    if (!event.startsWith("subscription")) return NextResponse.json({ received: true });

    const data = (payload?.data ?? {}) as Record<string, unknown>;
    userId = str(payload?.metadata?.user_id ?? (data.metadata as Record<string, unknown>)?.user_id);
    const productId = str(data.product_id);
    const mapped = productId ? tierForProduct(productId) : null;
    tier = mapped?.tier;
    cycle = mapped?.cycle;
    status = mapDodoStatus(String(data.status ?? "active"));
    externalId = str(data.subscription_id ?? data.id);
    renewsAt = data.next_billing_date ? new Date(String(data.next_billing_date)) : undefined;
    provider = "dodo";
  } else if (billingProviderName === "lemonsqueezy") {
    const {
      verifyWebhookSignature,
      tierForVariant,
      mapStatus,
    } = await import("@/lib/billing/lemonsqueezy");

    const ok = verifyWebhookSignature(raw, request.headers.get("x-signature"));
    if (!ok) return NextResponse.json({ error: "Invalid signature" }, { status: 401 });

    const payload = safeParse(raw);
    if (!payload) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    const event = String(payload?.meta?.event_name ?? "");
    if (!event.startsWith("subscription_")) return NextResponse.json({ received: true });

    userId = str(payload?.meta?.custom_data?.user_id);
    const attrs = (payload?.data?.attributes ?? {}) as Record<string, unknown>;
    const mapped = tierForVariant(String(attrs.variant_id ?? ""));
    tier = mapped?.tier;
    cycle = mapped?.cycle;
    status = mapStatus(String(attrs.status ?? "active"));
    externalId = str(payload?.data?.id);
    renewsAt = attrs.renews_at ? new Date(String(attrs.renews_at)) : undefined;
    provider = "lemonsqueezy";
  } else {
    // Mock mode — nothing to sync.
    return NextResponse.json({ received: true });
  }

  if (!userId || !Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ received: true });
  }

  await connectDB();
  await Subscription.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        provider,
        externalId,
        status,
        ...(tier ? { tier: status === "canceled" ? "starter" : (tier as string), cycle } : {}),
        currentPeriodEnd: renewsAt,
        trialEndsAt: undefined,
      },
    },
    { upsert: true }
  );

  return NextResponse.json({ received: true });
}

function safeParse(raw: string): any | null {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length ? v : v != null ? String(v) : undefined;
}
