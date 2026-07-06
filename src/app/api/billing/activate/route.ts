import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { Subscription } from "@/models/Subscription";

const schema = z.object({
  tier: z.enum(["starter", "pro", "studio"]),
  cycle: z.enum(["monthly", "yearly"]).default("monthly"),
});

/**
 * One-click plan change. Everything is free — selecting a plan just updates the
 * trainer's current plan instantly (no payment).
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  await Subscription.findOneAndUpdate(
    { user: session.user.id },
    {
      $set: {
        tier: parsed.data.tier,
        cycle: parsed.data.cycle,
        status: "active",
        provider: "mock",
        trialEndsAt: undefined,
      },
    },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
