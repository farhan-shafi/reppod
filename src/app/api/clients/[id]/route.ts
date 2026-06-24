import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { Client } from "@/models/Client";
import { User } from "@/models/User";
import { WorkoutAssignment } from "@/models/WorkoutAssignment";
import { WorkoutSession } from "@/models/WorkoutSession";
import { Message } from "@/models/Message";
import { Notification } from "@/models/Notification";
import { clientUpdateSchema } from "@/lib/schemas/client";

type Params = { params: Promise<{ id: string }> };

async function requireOwnedClient(id: string, trainerId: string) {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectDB();
  return Client.findOne({ _id: id, trainer: trainerId });
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const doc = await requireOwnedClient(id, session.user.id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { _id, trainer, ...rest } = doc.toObject();
  return NextResponse.json({
    client: { id: String(_id), trainer: String(trainer), ...rest },
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = clientUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const doc = await requireOwnedClient(id, session.user.id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  Object.assign(doc, parsed.data);
  await doc.save();

  const { _id, trainer, ...rest } = doc.toObject();
  return NextResponse.json({
    client: { id: String(_id), trainer: String(trainer), ...rest },
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const doc = await requireOwnedClient(id, session.user.id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Cascade: remove everything tied to this client so nothing is orphaned.
  await Promise.all([
    WorkoutAssignment.deleteMany({ client: doc._id }),
    WorkoutSession.deleteMany({ client: doc._id }),
    Message.deleteMany({ client: doc._id }),
  ]);

  // If the client had accepted their invite, remove their login + notifications.
  if (doc.user) {
    await Promise.all([
      User.deleteOne({ _id: doc.user }),
      Notification.deleteMany({ user: doc.user }),
    ]);
  }

  await doc.deleteOne();
  return NextResponse.json({ ok: true });
}
