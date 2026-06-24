import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireClientUser } from "@/lib/api-helpers";
import { WorkoutSession } from "@/models/WorkoutSession";
import { Workout } from "@/models/Workout";
import { createNotification } from "@/models/Notification";
import {
  sessionCreateSchema,
  type SerializedSession,
} from "@/lib/schemas/progress";

function computeVolume(blocks: SerializedSession["blocks"]): number {
  return blocks.reduce(
    (total, block) =>
      total + block.sets.reduce((b, set) => b + set.reps * set.weight, 0),
    0
  );
}

export async function GET() {
  const result = await requireClientUser();
  if ("error" in result) return result.error;

  const docs = await WorkoutSession.find({ client: result.client._id })
    .populate<{ workout?: { _id: Types.ObjectId; name: string } }>("workout", "name")
    .sort({ performedAt: -1 })
    .lean();

  const sessions: SerializedSession[] = docs.map((d) => ({
    id: String(d._id),
    client: String(d.client),
    workout: d.workout
      ? { id: String(d.workout._id), name: d.workout.name }
      : undefined,
    performedAt: d.performedAt,
    blocks: d.blocks,
    notes: d.notes,
    totalVolume: computeVolume(d.blocks),
  }));

  return NextResponse.json({ sessions });
}

export async function POST(request: Request) {
  const result = await requireClientUser();
  if ("error" in result) return result.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = sessionCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  let workoutRef: Types.ObjectId | undefined;
  let workoutName: string | undefined;
  if (parsed.data.workoutId && Types.ObjectId.isValid(parsed.data.workoutId)) {
    const workout = await Workout.findById(parsed.data.workoutId);
    if (workout) {
      workoutRef = workout._id;
      workoutName = workout.name;
    }
  }

  const created = await WorkoutSession.create({
    trainer: result.client.trainer,
    client: result.client._id,
    workout: workoutRef,
    performedAt: new Date(),
    blocks: parsed.data.blocks,
    notes: parsed.data.notes || undefined,
  });

  await createNotification({
    user: result.client.trainer,
    type: "session_logged",
    title: `${result.client.name} logged a workout`,
    body: workoutName ? `Completed ${workoutName}.` : "Session logged.",
    link: `/dashboard/clients/${result.client._id}`,
  });

  const session: SerializedSession = {
    id: String(created._id),
    client: String(created.client),
    workout: workoutRef
      ? { id: String(workoutRef), name: workoutName ?? "Workout" }
      : undefined,
    performedAt: created.performedAt,
    blocks: created.blocks,
    notes: created.notes,
    totalVolume: computeVolume(created.blocks),
  };

  return NextResponse.json({ session }, { status: 201 });
}
