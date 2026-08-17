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
import { User } from "@/models/User";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: emailSchema,
  password: newPasswordSchema,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const rateLimit = await checkRateLimit(
      rateLimitKey("register", `${getClientAddress(request)}:${email}`),
      5,
      15 * 60 * 1000
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many sign-up attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        }
      );
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await User.create({
      name,
      email,
      passwordHash,
      role: "trainer",
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
