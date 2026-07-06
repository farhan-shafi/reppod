import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { requireUser } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/mongoose";
import { Workout } from "@/models/Workout";
import type { SerializedWorkout } from "@/lib/schemas/workout";
import WorkoutDetailView from "./WorkoutDetailView";

type Params = { params: Promise<{ id: string }> };

export const metadata = {
  title: "Workout · Reppod",
};

export default async function WorkoutDetailPage({ params }: Params) {
  const { id } = await params;
  const user = await requireUser();

  if (!Types.ObjectId.isValid(id)) notFound();

  await connectDB();
  const doc = await Workout.findOne({ _id: id, trainer: user.id }).lean();
  if (!doc) notFound();

  const { _id, trainer, ...rest } = doc;
  const workout: SerializedWorkout = {
    id: String(_id),
    trainer: String(trainer),
    ...(rest as Omit<SerializedWorkout, "id" | "trainer">),
  };

  return <WorkoutDetailView workout={workout} />;
}
