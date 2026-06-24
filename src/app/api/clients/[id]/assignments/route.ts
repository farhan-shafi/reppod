import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireOwnedClient } from "@/lib/api-helpers";
import { Workout } from "@/models/Workout";
import { WorkoutAssignment } from "@/models/WorkoutAssignment";
import { createNotification } from "@/models/Notification";
import { assignWorkoutSchema, type SerializedAssignment } from "@/lib/schemas/progress";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const result = await requireOwnedClient(id);
  if ("error" in result) return result.error;

  const docs = await WorkoutAssignment.find({ client: id })
    .populate<{ workout: { _id: Types.ObjectId; name: string; blocks: unknown[] } }>(
      "workout",
      "name blocks"
    )
    .sort({ assignedAt: -1 })
    .lean();

  const assignments: SerializedAssignment[] = docs
    .filter((d) => d.workout)
    .map((d) => ({
      id: String(d._id),
      client: String(d.client),
      workout: {
        id: String(d.workout._id),
        name: d.workout.name,
        blockCount: Array.isArray(d.workout.blocks) ? d.workout.blocks.length : 0,
      },
      assignedAt: d.assignedAt,
      status: d.status,
    }));

  return NextResponse.json({ assignments });
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

  const parsed = assignWorkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  if (!Types.ObjectId.isValid(parsed.data.workoutId)) {
    return NextResponse.json({ error: "Invalid workout" }, { status: 400 });
  }

  const workout = await Workout.findOne({
    _id: parsed.data.workoutId,
    trainer: result.trainerId,
  });
  if (!workout) {
    return NextResponse.json({ error: "Workout not found" }, { status: 404 });
  }

  try {
    const created = await WorkoutAssignment.create({
      trainer: result.trainerId,
      client: id,
      workout: workout._id,
    });

    if (result.client.user) {
      await createNotification({
        user: result.client.user,
        type: "workout_assigned",
        title: "New workout assigned",
        body: `Your coach assigned "${workout.name}".`,
        link: `/app/workouts/${workout._id}`,
      });
    }

    const assignment: SerializedAssignment = {
      id: String(created._id),
      client: String(created.client),
      workout: {
        id: String(workout._id),
        name: workout.name,
        blockCount: workout.blocks.length,
      },
      assignedAt: created.assignedAt,
      status: created.status,
    };

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: "This workout is already assigned to this client." },
        { status: 409 }
      );
    }
    throw err;
  }
}
