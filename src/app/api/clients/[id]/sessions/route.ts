import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireOwnedClient } from "@/lib/api-helpers";
import { WorkoutSession } from "@/models/WorkoutSession";
import { Workout } from "@/models/Workout";
import {
  sessionCreateSchema,
  type SerializedSession,
} from "@/lib/schemas/progress";

type Params = { params: Promise<{ id: string }> };

function computeVolume(blocks: SerializedSession["blocks"]): number {
  return blocks.reduce((total, block) => {
    return (
      total +
      block.sets.reduce(
        (blockTotal, set) => blockTotal + set.reps * set.weight,
        0
      )
    );
  }, 0);
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const result = await requireOwnedClient(id);
  if ("error" in result) return result.error;

  const docs = await WorkoutSession.find({ client: id })
    .populate<{ workout?: { _id: Types.ObjectId; name: string } }>(
      "workout",
      "name"
    )
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

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const result = await requireOwnedClient(id);
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
  if (parsed.data.workoutId) {
    if (!Types.ObjectId.isValid(parsed.data.workoutId)) {
      return NextResponse.json({ error: "Invalid workout" }, { status: 400 });
    }
    const workout = await Workout.findOne({
      _id: parsed.data.workoutId,
      trainer: result.trainerId,
    });
    if (workout) {
      workoutRef = workout._id;
      workoutName = workout.name;
    }
  }

  const created = await WorkoutSession.create({
    trainer: result.trainerId,
    client: id,
    workout: workoutRef,
    performedAt: parsed.data.performedAt
      ? new Date(parsed.data.performedAt)
      : new Date(),
    blocks: parsed.data.blocks,
    notes: parsed.data.notes || undefined,
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
