"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LineChart as LineIcon, Loader2, Plus } from "lucide-react";

import type {
  SerializedAssignment,
  SerializedSession,
} from "@/lib/schemas/progress";
import type { SerializedCheckin } from "@/lib/schemas/checkin";
import LogSessionModal from "./LogSessionModal";
import VolumeChart from "./VolumeChart";
import MetricChart from "@/components/checkins/MetricChart";
import CheckinList from "@/components/checkins/CheckinList";
import PhotoGallery from "@/components/checkins/PhotoGallery";

export default function ProgressTab({
  clientId,
  assignments,
  initialSessions,
  checkins,
}: {
  clientId: string;
  assignments: SerializedAssignment[];
  initialSessions: SerializedSession[];
  checkins: SerializedCheckin[];
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [logOpen, setLogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const chartData = useMemo(
    () =>
      [...sessions]
        .reverse()
        .map((s) => ({
          date: new Date(s.performedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          volume: s.totalVolume,
        })),
    [sessions]
  );

  const weightData = useMemo(
    () =>
      [...checkins]
        .filter((c) => typeof c.weightKg === "number")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((c) => ({
          date: new Date(c.date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          value: c.weightKg as number,
        })),
    [checkins]
  );

  async function deleteSession(id: string) {
    if (!confirm("Delete this session?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/clients/${clientId}/sessions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert("Could not delete session.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Progress</h2>
        <button
          onClick={() => setLogOpen(true)}
          disabled={assignments.length === 0}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition disabled:opacity-50"
        >
          <Plus className="size-3.5" />
          Log session
        </button>
      </div>

      {/* Check-ins & body weight (client-submitted) */}
      {checkins.length > 0 && (
        <div className="space-y-5">
          {weightData.length >= 2 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h3 className="text-xs uppercase tracking-wider text-white/50 mb-3">
                Body weight trend
              </h3>
              <MetricChart data={weightData} unit="kg" />
            </div>
          )}
          {checkins.some((c) => c.photos.length > 0) && (
            <PhotoGallery checkins={checkins} />
          )}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-white/50 mb-2">
              Recent check-ins
            </h3>
            <CheckinList checkins={checkins} />
          </div>
        </div>
      )}

      <h3 className="text-xs uppercase tracking-wider text-white/50 pt-2">
        Training volume
      </h3>
      {assignments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/60">
          Assign a workout in the <strong>Workouts</strong> tab first, then log
          sessions here.
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
          <LineIcon className="mx-auto size-6 text-white/40" />
          <p className="mt-3 text-sm text-white/60">
            No sessions logged yet. Track this client&apos;s first workout to see
            their progress curve.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-xs uppercase tracking-wider text-white/50 mb-4">
              Total volume per session
            </h3>
            <VolumeChart data={chartData} />
          </div>

          <ul className="space-y-2">
            <AnimatePresence mode="popLayout">
              {sessions.map((s) => (
                <motion.li
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white">
                        {s.workout?.name ?? "Custom session"}
                      </p>
                      <p className="text-xs text-white/50">
                        {new Date(s.performedAt).toLocaleString()} ·{" "}
                        <strong className="text-white/80">
                          {s.totalVolume.toLocaleString()}
                        </strong>{" "}
                        kg total volume
                      </p>
                    </div>
                    <button
                      onClick={() => deleteSession(s.id)}
                      disabled={deletingId === s.id}
                      className="text-xs text-white/40 hover:text-red-300 transition disabled:opacity-50"
                    >
                      {deletingId === s.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        "Delete"
                      )}
                    </button>
                  </div>
                  {s.notes && (
                    <p className="mt-2 text-xs text-white/60 whitespace-pre-wrap">
                      {s.notes}
                    </p>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </>
      )}

      <LogSessionModal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        clientId={clientId}
        assignments={assignments}
        onLogged={(session) => setSessions((prev) => [session, ...prev])}
      />
    </div>
  );
}
