import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireClientUser } from "@/lib/api-helpers";
import { VideoProgress } from "@/models/VideoProgress";
import {
  videoProgressSchema,
  COMPLETION_THRESHOLD,
  type SerializedVideoProgress,
} from "@/lib/schemas/video";

export async function POST(request: Request) {
  const result = await requireClientUser();
  if ("error" in result) return result.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = videoProgressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { workoutId, exerciseId, watchedSeconds, duration } = parsed.data;
  if (!Types.ObjectId.isValid(workoutId)) {
    return NextResponse.json({ error: "Invalid workout" }, { status: 400 });
  }

  const existing = await VideoProgress.findOne({
    client: result.client._id,
    workout: workoutId,
    exerciseId,
  });

  // Track the furthest point reached so re-watching from the start never lowers it.
  const furthest = Math.max(existing?.watchedSeconds ?? 0, watchedSeconds);
  const dur = duration || existing?.duration || 0;
  const percent = dur > 0 ? Math.min(1, furthest / dur) : 0;
  const completed = (existing?.completed ?? false) || percent >= COMPLETION_THRESHOLD;

  const doc = await VideoProgress.findOneAndUpdate(
    { client: result.client._id, workout: workoutId, exerciseId },
    {
      $set: {
        trainer: result.client.trainer,
        watchedSeconds: furthest,
        duration: dur,
        percent,
        completed,
      },
    },
    { upsert: true, new: true }
  );

  const payload: SerializedVideoProgress = {
    workoutId,
    exerciseId,
    watchedSeconds: doc.watchedSeconds,
    duration: doc.duration,
    percent: doc.percent,
    completed: doc.completed,
  };

  return NextResponse.json({ progress: payload });
}
