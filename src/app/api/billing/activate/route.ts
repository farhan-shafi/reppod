import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { Subscription } from "@/models/Subscription";
import { billingMode } from "@/lib/billing/provider";

const schema = z.object({
  tier: z.enum(["starter", "pro", "studio"]),
  cycle: z.enum(["monthly", "yearly"]).default("monthly"),
});

/**
 * Completes a (mock) checkout: marks the trainer's subscription active on the
 * chosen tier. In live mode this is driven by a provider webhook instead, so
 * this endpoint only runs while billing is mocked.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (billingMode !== "mock") {
    return NextResponse.json(
      { error: "Activation is handled by the payment provider." },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  await connectDB();
  const periodMs =
    parsed.data.cycle === "yearly" ? 365 * 86400000 : 30 * 86400000;

  await Subscription.findOneAndUpdate(
    { user: session.user.id },
    {
      $set: {
        tier: parsed.data.tier,
        cycle: parsed.data.cycle,
        status: "active",
        provider: "mock",
        currentPeriodEnd: new Date(Date.now() + periodMs),
        trialEndsAt: undefined,
      },
    },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
