"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Loader2, X } from "lucide-react";

import {
  PHOTO_POSES,
  POSE_LABELS,
  RATING_FIELDS,
  RATING_LABELS,
  type CheckinPhoto,
  type PhotoPose,
  type SerializedCheckin,
} from "@/lib/schemas/checkin";
import { uploadImage, cloudinaryConfigured } from "@/lib/cloudinary";

export default function CheckinForm({
  open,
  onClose,
  onSubmitted,
}: {
  open: boolean;
  onClose: () => void;
  onSubmitted: (checkin: SerializedCheckin) => void;
}) {
  const [weight, setWeight] = useState("");
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<CheckinPhoto[]>([]);
  const [pose, setPose] = useState<PhotoPose>("front");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setPhotos((prev) => [...prev, { url, pose }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function submit() {
    setError(null);
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { note, photos };
      if (weight) payload.weightKg = Number(weight);
      for (const r of RATING_FIELDS) if (ratings[r]) payload[r] = ratings[r];

      const res = await fetch("/api/me/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not submit check-in.");
        return;
      }
      onSubmitted(data.checkin);
      // reset
      setWeight("");
      setRatings({});
      setNote("");
      setPhotos([]);
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => !saving && onClose()}
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[88vh] flex flex-col rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Weekly check-in</h2>
              <button
                onClick={onClose}
                disabled={saving}
                className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-white/50">
                  Body weight (kg)
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 78.5"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-fuchsia-500/50 transition"
                />
              </label>

              <div className="space-y-3">
                <span className="text-xs uppercase tracking-wider text-white/50">
                  How was your week? (1–5)
                </span>
                {RATING_FIELDS.map((r) => (
                  <div key={r} className="flex items-center justify-between">
                    <span className="text-sm text-white/70">{RATING_LABELS[r]}</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setRatings((p) => ({ ...p, [r]: n }))}
                          className={`size-7 rounded-full text-xs transition ${
                            ratings[r] === n
                              ? "bg-gradient-to-br from-fuchsia-500 to-orange-500 text-white"
                              : "bg-white/5 text-white/50 hover:bg-white/10"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-white/50">
                  Progress photos
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <select
                    value={pose}
                    onChange={(e) => setPose(e.target.value as PhotoPose)}
                    className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-fuchsia-500/50"
                  >
                    {PHOTO_POSES.map((p) => (
                      <option key={p} value={p} className="bg-zinc-900">
                        {POSE_LABELS[p]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading || !cloudinaryConfigured}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm hover:bg-white/15 transition disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <ImagePlus className="size-3.5" />
                    )}
                    Add photo
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={onPickPhoto}
                    className="hidden"
                  />
                </div>
                {!cloudinaryConfigured && (
                  <p className="mt-1 text-[11px] text-white/40">
                    Add Cloudinary keys to enable photo uploads.
                  </p>
                )}
                {photos.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {photos.map((p, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt={p.pose} className="size-full object-cover" />
                        <button
                          onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                          className="absolute top-1 right-1 p-0.5 rounded bg-black/60 text-white/80 hover:text-white"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label className="block">
                <span className="text-xs uppercase tracking-wider text-white/50">
                  Note for your coach
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Anything to flag this week?"
                  className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-fuchsia-500/50 transition resize-none"
                />
              </label>

              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
              <button
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-full text-sm text-white/80 hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={saving || uploading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition disabled:opacity-60"
              >
                {saving && <Loader2 className="size-3.5 animate-spin" />}
                Submit check-in
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
