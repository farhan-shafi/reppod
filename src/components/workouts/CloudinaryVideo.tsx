"use client";

import { useRef, useState } from "react";
import { Loader2, Video, X } from "lucide-react";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const cloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

export default function CloudinaryVideo({
  videoUrl,
  onChange,
}: {
  videoUrl?: string;
  onChange: (url: string, duration: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!cloudinaryConfigured) {
      setError("Video uploads aren't configured.");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", UPLOAD_PRESET!);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
        { method: "POST", body: form }
      );
      const data = await res.json();
      if (!res.ok || !data.secure_url) {
        setError(
          data.error?.message ??
            "Upload failed. Make sure your Cloudinary preset allows video."
        );
        return;
      }
      onChange(data.secure_url, Math.round(data.duration ?? 0));
    } catch {
      setError("Upload failed. Check your connection.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  if (videoUrl) {
    return (
      <div className="mt-3 relative">
        <video
          src={videoUrl}
          controls
          preload="metadata"
          className="w-full max-h-48 rounded-lg bg-black"
        />
        <button
          type="button"
          onClick={() => onChange("", 0)}
          className="absolute top-2 right-2 p-1 rounded-md bg-black/60 text-white/80 hover:text-white hover:bg-black/80 transition"
          aria-label="Remove video"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || !cloudinaryConfigured}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-white/15 text-white/60 text-xs hover:text-white hover:border-white/30 transition disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Video className="size-3.5" />
        )}
        {uploading ? "Uploading…" : "Add demo video"}
      </button>
      {!cloudinaryConfigured && (
        <p className="mt-1 text-[11px] text-white/40">
          Add Cloudinary keys to enable video uploads.
        </p>
      )}
      {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={onFile}
        className="hidden"
      />
    </div>
  );
}
