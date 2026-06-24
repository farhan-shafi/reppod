import Link from "next/link";
import { notFound } from "next/navigation";
import { Types } from "mongoose";
import { ArrowLeft } from "lucide-react";

import { requireUser } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/mongoose";
import { Client } from "@/models/Client";
import { Workout } from "@/models/Workout";
import { WorkoutAssignment } from "@/models/WorkoutAssignment";
import { WorkoutSession } from "@/models/WorkoutSession";
import { Message } from "@/models/Message";
import { VideoProgress } from "@/models/VideoProgress";
import { GOAL_LABELS, STATUS_LABELS } from "@/lib/schemas/client";
import type {
  SerializedAssignment,
  SerializedSession,
  SerializedMessage,
} from "@/lib/schemas/progress";
import ClientDetailTabs from "@/components/client-detail/ClientDetailTabs";
import type { EngagementItem } from "@/components/client-detail/EngagementTab";

type Params = { params: Promise<{ id: string }> };

export default async function ClientDetailPage({ params }: Params) {
  const { id } = await params;
  const user = await requireUser();

  if (!Types.ObjectId.isValid(id)) notFound();

  await connectDB();
  const doc = await Client.findOne({ _id: id, trainer: user.id }).lean();
  if (!doc) notFound();

  const [allWorkouts, assignmentDocs, sessionDocs, messageDocs, progressDocs] =
    await Promise.all([
      Workout.find({ trainer: user.id }).select("name blocks").sort({ name: 1 }).lean(),
      WorkoutAssignment.find({ client: id })
        .populate<{
          workout: {
            _id: Types.ObjectId;
            name: string;
            blocks: { exerciseId: string; videoUrl?: string }[];
          };
        }>("workout", "name blocks")
        .sort({ assignedAt: -1 })
        .lean(),
      WorkoutSession.find({ client: id })
        .populate<{ workout?: { _id: Types.ObjectId; name: string } }>("workout", "name")
        .sort({ performedAt: -1 })
        .lean(),
      Message.find({ client: id }).sort({ createdAt: 1 }).lean(),
      VideoProgress.find({ client: id }).lean(),
    ]);

  // Build the per-exercise video engagement list from assigned workouts.
  const progressMap = new Map(
    progressDocs.map((p) => [
      `${String(p.workout)}:${p.exerciseId}`,
      { percent: p.percent, completed: p.completed },
    ])
  );
  const engagement: EngagementItem[] = [];
  for (const a of assignmentDocs) {
    if (!a.workout) continue;
    const wId = String(a.workout._id);
    for (const b of a.workout.blocks) {
      if (!b.videoUrl) continue;
      const p = progressMap.get(`${wId}:${b.exerciseId}`);
      engagement.push({
        workoutId: wId,
        workoutName: a.workout.name,
        exerciseId: b.exerciseId,
        percent: p?.percent ?? 0,
        completed: p?.completed ?? false,
      });
    }
  }

  const workoutOptions = allWorkouts.map((w) => ({
    id: String(w._id),
    name: w.name,
    blockCount: w.blocks.length,
  }));

  const assignments: SerializedAssignment[] = assignmentDocs
    .filter((a) => a.workout)
    .map((a) => ({
      id: String(a._id),
      client: String(a.client),
      workout: {
        id: String(a.workout._id),
        name: a.workout.name,
        blockCount: Array.isArray(a.workout.blocks) ? a.workout.blocks.length : 0,
      },
      assignedAt: a.assignedAt,
      status: a.status,
    }));

  const sessions: SerializedSession[] = sessionDocs.map((s) => ({
    id: String(s._id),
    client: String(s.client),
    workout: s.workout
      ? { id: String(s.workout._id), name: s.workout.name }
      : undefined,
    performedAt: s.performedAt,
    blocks: s.blocks,
    notes: s.notes,
    totalVolume: s.blocks.reduce(
      (sum, block) =>
        sum + block.sets.reduce((b, set) => b + set.reps * set.weight, 0),
      0
    ),
  }));

  const messages: SerializedMessage[] = messageDocs.map((m) => ({
    id: String(m._id),
    senderRole: m.senderRole,
    body: m.body,
    createdAt: m.createdAt,
  }));

  const startDate = doc.startDate
    ? new Date(doc.startDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const initials = doc.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/clients"
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition"
      >
        <ArrowLeft className="size-4" />
        Back to clients
      </Link>

      <div className="flex items-start gap-5">
        <div className="size-16 shrink-0 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-orange-500 flex items-center justify-center text-lg font-semibold text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-white truncate">
            {doc.name}
          </h1>
          <p className="mt-1 text-white/60 text-sm">
            {doc.email ?? "No email on file"}
            {doc.phone ? ` · ${doc.phone}` : ""}
          </p>
          <div className="mt-3 flex gap-2 flex-wrap text-xs">
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/80">
              {STATUS_LABELS[doc.status]}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/80">
              {GOAL_LABELS[doc.goal]}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">
              Since {startDate}
            </span>
          </div>
        </div>
      </div>

      <ClientDetailTabs
        clientId={id}
        clientName={doc.name}
        clientNotes={doc.notes}
        hasAccount={doc.inviteStatus === "accepted"}
        workoutOptions={workoutOptions}
        initialAssignments={assignments}
        initialSessions={sessions}
        initialMessages={messages}
        engagement={engagement}
      />
    </div>
  );
}
