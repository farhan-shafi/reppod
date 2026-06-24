"use client";

import { useMemo, useState } from "react";
import { POSE_LABELS, type SerializedCheckin } from "@/lib/schemas/checkin";
import BeforeAfterSlider from "./BeforeAfterSlider";

type PhotoEntry = { url: string; pose: string; date: string | Date };

export default function PhotoGallery({
  checkins,
}: {
  checkins: SerializedCheckin[];
}) {
  // Flatten photos with their check-in date, newest first.
  const photos: PhotoEntry[] = useMemo(
    () =>
      checkins
        .flatMap((c) => c.photos.map((p) => ({ ...p, date: c.date })))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [checkins]
  );

  // Auto before/after: earliest vs latest "front" photo (fallback: any).
  const fronts = useMemo(() => {
    const f = photos.filter((p) => p.pose === "front");
    const pool = f.length >= 2 ? f : photos;
    if (pool.length < 2) return null;
    const sorted = [...pool].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return { before: sorted[0], after: sorted[sorted.length - 1] };
  }, [photos]);

  const [showCompare, setShowCompare] = useState(true);

  if (photos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-sm text-white/50">
        No progress photos yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fronts && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs uppercase tracking-wider text-white/50">
              Before / after
            </h4>
            <button
              onClick={() => setShowCompare((v) => !v)}
              className="text-xs text-fuchsia-300 hover:text-fuchsia-200 transition"
            >
              {showCompare ? "Hide" : "Show"}
            </button>
          </div>
          {showCompare && (
            <>
              <BeforeAfterSlider
                before={fronts.before.url}
                after={fronts.after.url}
                beforeLabel={new Date(fronts.before.date).toLocaleDateString()}
                afterLabel={new Date(fronts.after.date).toLocaleDateString()}
              />
              <p className="mt-1 text-[11px] text-white/40 text-center">
                Drag the handle to compare
              </p>
            </>
          )}
        </div>
      )}

      <div>
        <h4 className="text-xs uppercase tracking-wider text-white/50 mb-2">
          All photos
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {photos.map((p, i) => (
            <a
              key={i}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-lg overflow-hidden border border-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.pose} className="size-full object-cover" />
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px]">
                {POSE_LABELS[p.pose as keyof typeof POSE_LABELS] ?? p.pose} ·{" "}
                {new Date(p.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
