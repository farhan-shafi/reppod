"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import type { SerializedCheckin } from "@/lib/schemas/checkin";
import CheckinForm from "@/components/checkins/CheckinForm";
import CheckinList from "@/components/checkins/CheckinList";
import MetricChart from "@/components/checkins/MetricChart";
import PhotoGallery from "@/components/checkins/PhotoGallery";

export default function ClientCheckinSection({
  initialCheckins,
}: {
  initialCheckins: SerializedCheckin[];
}) {
  const [checkins, setCheckins] = useState(initialCheckins);
  const [formOpen, setFormOpen] = useState(false);

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

  async function deleteCheckin(id: string) {
    if (!confirm("Delete this check-in?")) return;
    try {
      const res = await fetch(`/api/me/checkins/${id}`, { method: "DELETE" });
      if (res.ok) setCheckins((prev) => prev.filter((c) => c.id !== id));
      else alert("Could not delete check-in.");
    } catch {
      alert("Network error.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Check-ins</h2>
        <button
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition"
        >
          <Plus className="size-3.5" />
          New check-in
        </button>
      </div>

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

      <CheckinList checkins={checkins} onDelete={deleteCheckin} />

      <CheckinForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmitted={(c) => setCheckins((prev) => [c, ...prev])}
      />
    </div>
  );
}
