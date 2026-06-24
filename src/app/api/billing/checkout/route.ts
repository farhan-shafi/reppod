import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getBillingProvider } from "@/lib/billing/provider";
import { TIERS } from "@/lib/billing/plans";

const schema = z.object({
  tier: z.enum(["starter", "pro", "studio"]),
  cycle: z.enum(["monthly", "yearly"]).default("monthly"),
});

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
  if (!parsed.success || !TIERS.includes(parsed.data.tier)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const provider = getBillingProvider();
  const { url } = await provider.createCheckout({
    userId: session.user.id,
    tier: parsed.data.tier,
    cycle: parsed.data.cycle,
    origin,
  });

  return NextResponse.json({ url });
}
