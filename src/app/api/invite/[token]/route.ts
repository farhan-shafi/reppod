import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { connectDB } from "@/lib/mongoose";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  emailSchema,
  getClientAddress,
  newPasswordSchema,
  rateLimitKey,
} from "@/lib/security";
import { Client } from "@/models/Client";
import { User } from "@/models/User";
import { createNotification } from "@/models/Notification";

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { token } = await params;
  await connectDB();

  const client = await Client.findOne({ inviteToken: token })
    .populate<{ trainer: { name: string; businessName?: string } }>(
      "trainer",
      "name businessName"
    )
    .lean();

  if (!client) {
    return NextResponse.json({ error: "Invalid invite link" }, { status: 404 });
  }

  if (client.inviteStatus === "accepted") {
    return NextResponse.json(
      { error: "This invite has already been used", accepted: true },
      { status: 409 }
    );
  }

  return NextResponse.json({
    clientName: client.name,
    email: client.email ?? "",
    trainerName: client.trainer?.businessName || client.trainer?.name || "Your coach",
  });
}

const acceptSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: emailSchema,
  password: newPasswordSchema,
});

export async function POST(request: Request, { params }: Params) {
  const { token } = await params;

  const rateLimit = await checkRateLimit(
    rateLimitKey("accept-invite", `${getClientAddress(request)}:${token}`),
    8,
    15 * 60 * 1000
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = acceptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await connectDB();
  const client = await Client.findOne({ inviteToken: token });
  if (!client) {
    return NextResponse.json({ error: "Invalid invite link" }, { status: 404 });
  }
  if (client.inviteStatus === "accepted") {
    return NextResponse.json(
      { error: "This invite has already been used" },
      { status: 409 }
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists. Please sign in." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: "client",
  });

  client.user = user._id;
  client.name = name;
  client.email = email;
  client.inviteStatus = "accepted";
  client.inviteToken = undefined;
  await client.save();

  await createNotification({
    user: client.trainer,
    type: "invite_accepted",
    title: `${name} accepted your invite`,
    body: "They can now log workouts and message you.",
    link: `/dashboard/clients/${client._id}`,
  });

  return NextResponse.json({ ok: true, email });
}
