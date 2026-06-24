import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { Workout } from "@/models/Workout";
import { WorkoutAssignment } from "@/models/WorkoutAssignment";
import { workoutUpdateSchema } from "@/lib/schemas/workout";

type Params = { params: Promise<{ id: string }> };

async function requireOwnedWorkout(id: string, trainerId: string) {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectDB();
  return Workout.findOne({ _id: id, trainer: trainerId });
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const doc = await requireOwnedWorkout(id, session.user.id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { _id, trainer, ...rest } = doc.toObject();
  return NextResponse.json({
    workout: { id: String(_id), trainer: String(trainer), ...rest },
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

  const parsed = workoutUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const doc = await requireOwnedWorkout(id, session.user.id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  Object.assign(doc, parsed.data);
  await doc.save();

  const { _id, trainer, ...rest } = doc.toObject();
  return NextResponse.json({
    workout: { id: String(_id), trainer: String(trainer), ...rest },
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const doc = await requireOwnedWorkout(id, session.user.id);
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Remove assignments pointing at this workout. Logged sessions are kept as
  // historical records (their workout ref simply becomes empty).
  await WorkoutAssignment.deleteMany({ workout: doc._id });

  await doc.deleteOne();
  return NextResponse.json({ ok: true });
}
