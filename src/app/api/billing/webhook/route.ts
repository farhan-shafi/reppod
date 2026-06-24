import { NextResponse } from "next/server";

/**
 * Provider webhook endpoint (LemonSqueezy / Stripe).
 *
 * In live mode this is where you'd verify the signature and update the matching
 * Subscription (subscription_created / updated / cancelled, payment_failed…).
 * It's a documented no-op while billing runs in mock mode.
 */
export async function POST() {
  return NextResponse.json({ received: true });
}
