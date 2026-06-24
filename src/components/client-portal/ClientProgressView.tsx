"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { SerializedSession } from "@/lib/schemas/progress";
import VolumeChart from "@/components/client-detail/VolumeChart";

export default function ClientProgressView({
  sessions,
}: {
  sessions: SerializedSession[];
}) {
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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="text-xs uppercase tracking-wider text-white/50 mb-4">
          Total volume per session
        </h3>
        <VolumeChart data={chartData} />
      </div>

      <ul className="space-y-2">
        {sessions.map((s, i) => (
          <motion.li
            key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.03 }}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-white">
                  {s.workout?.name ?? "Session"}
                </p>
                <p className="text-xs text-white/50">
                  {new Date(s.performedAt).toLocaleString()}
                </p>
              </div>
              <span className="text-sm text-fuchsia-300">
                {s.totalVolume.toLocaleString()} kg
              </span>
            </div>
            {s.notes && (
              <p className="mt-2 text-xs text-white/60 whitespace-pre-wrap">
                {s.notes}
              </p>
            )}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
