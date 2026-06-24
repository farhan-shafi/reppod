import { notFound } from "next/navigation";
import { Types } from "mongoose";

import { requireClient } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/mongoose";
import { WorkoutAssignment } from "@/models/WorkoutAssignment";
import { Workout } from "@/models/Workout";
import { VideoProgress } from "@/models/VideoProgress";
import ClientWorkoutView from "@/components/client-portal/ClientWorkoutView";

type Params = { params: Promise<{ id: string }> };

export const metadata = { title: "Workout · FlexFlow" };

export default async function ClientWorkoutPage({ params }: Params) {
  const { id } = await params;
  const { client } = await requireClient();

  if (!Types.ObjectId.isValid(id)) notFound();

  await connectDB();
  // Confirm this workout is actually assigned to this client.
  const assignment = await WorkoutAssignment.findOne({
    client: client._id,
    workout: id,
  });
  if (!assignment) notFound();

  const [workout, progressDocs] = await Promise.all([
    Workout.findById(id).lean(),
    VideoProgress.find({ client: client._id, workout: id }).lean(),
  ]);
  if (!workout) notFound();

  const progressByExercise = Object.fromEntries(
    progressDocs.map((p) => [
      p.exerciseId,
      { percent: p.percent, completed: p.completed },
    ])
  );

  return (
    <ClientWorkoutView
      workout={{
        id: String(workout._id),
        name: workout.name,
        description: workout.description,
        blocks: workout.blocks.map((b) => ({
          exerciseId: b.exerciseId,
          sets: b.sets,
          reps: b.reps,
          restSec: b.restSec,
          videoUrl: b.videoUrl,
          videoPercent: progressByExercise[b.exerciseId]?.percent ?? 0,
          videoCompleted: progressByExercise[b.exerciseId]?.completed ?? false,
        })),
      }}
    />
  );
}
