import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { Client } from "@/models/Client";
import { clientCreateSchema } from "@/lib/schemas/client";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const clients = await Client.find({ trainer: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    clients: clients.map(({ _id, trainer, ...rest }) => ({
      id: String(_id),
      trainer: String(trainer),
      ...rest,
    })),
  });
}

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

  const parsed = clientCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await connectDB();
  const created = await Client.create({
    ...parsed.data,
    email: parsed.data.email || undefined,
    phone: parsed.data.phone || undefined,
    notes: parsed.data.notes || undefined,
    trainer: session.user.id,
    inviteToken: randomBytes(24).toString("hex"),
    inviteStatus: "pending",
  });

  const { _id, trainer, ...rest } = created.toObject();
  return NextResponse.json(
    {
      client: { id: String(_id), trainer: String(trainer), ...rest },
    },
    { status: 201 }
  );
}
