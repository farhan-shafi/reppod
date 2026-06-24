import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { Workout } from "@/models/Workout";
import { workoutCreateSchema } from "@/lib/schemas/workout";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const docs = await Workout.find({ trainer: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    workouts: docs.map(({ _id, trainer, ...rest }) => ({
      id: String(_id),
      trainer: String(trainer),
      ...rest,
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = workoutCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await connectDB();
  const created = await Workout.create({
    ...parsed.data,
    trainer: session.user.id,
  });

  const { _id, trainer, ...rest } = created.toObject();
  return NextResponse.json(
    {
      workout: { id: String(_id), trainer: String(trainer), ...rest },
    },
    { status: 201 }
  );
}
