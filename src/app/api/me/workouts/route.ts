import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireClientUser } from "@/lib/api-helpers";
import { WorkoutAssignment } from "@/models/WorkoutAssignment";
import { Workout } from "@/models/Workout";

export async function GET() {
  const result = await requireClientUser();
  if ("error" in result) return result.error;

  const docs = await WorkoutAssignment.find({ client: result.client._id })
    .populate<{
      workout: {
        _id: Types.ObjectId;
        name: string;
        description?: string;
        blocks: { exerciseId: string; sets: number; reps: string; restSec: number }[];
      };
    }>({ path: "workout", model: Workout, select: "name description blocks" })
    .sort({ assignedAt: -1 })
    .lean();

  const workouts = docs
    .filter((d) => d.workout)
    .map((d) => ({
      assignmentId: String(d._id),
      assignedAt: d.assignedAt,
      workout: {
        id: String(d.workout._id),
        name: d.workout.name,
        description: d.workout.description,
        blocks: d.workout.blocks,
      },
    }));

  return NextResponse.json({ workouts });
}
