import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { Subscription } from "@/models/Subscription";
import {
  verifyWebhookSignature,
  tierForVariant,
  mapStatus,
} from "@/lib/billing/lemonsqueezy";

/**
 * LemonSqueezy webhook. Verifies the HMAC signature, then keeps the local
 * Subscription in sync with subscription_* events. No-op if LS isn't configured.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: {
    meta?: { event_name?: string; custom_data?: { user_id?: string } };
    data?: { id?: string; attributes?: Record<string, unknown> };
  };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload.meta?.event_name ?? "";
  if (!event.startsWith("subscription_")) {
    return NextResponse.json({ received: true });
  }

  const userId = payload.meta?.custom_data?.user_id;
  if (!userId || !Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ received: true });
  }

  const attrs = payload.data?.attributes ?? {};
  const variantId = String(attrs.variant_id ?? "");
  const mapped = tierForVariant(variantId);
  const status = mapStatus(String(attrs.status ?? "active"));
  const renewsAt = attrs.renews_at ? new Date(String(attrs.renews_at)) : undefined;

  await connectDB();
  await Subscription.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        provider: "lemonsqueezy",
        externalId: payload.data?.id,
        status,
        ...(mapped
          ? {
              tier: status === "canceled" ? "starter" : mapped.tier,
              cycle: mapped.cycle,
            }
          : {}),
        currentPeriodEnd: renewsAt,
        trialEndsAt: undefined,
      },
    },
    { upsert: true }
  );

  return NextResponse.json({ received: true });
}
