import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { Subscription } from "@/models/Subscription";

/** Downgrades the trainer to the Starter plan. */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  await Subscription.findOneAndUpdate(
    { user: session.user.id },
    {
      $set: {
        tier: "starter",
        status: "active",
        trialEndsAt: undefined,
      },
    },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
