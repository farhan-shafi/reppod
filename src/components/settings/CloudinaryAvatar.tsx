"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const cloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

export default function CloudinaryAvatar({
  value,
  fallbackInitials,
  onChange,
}: {
  value?: string;
  fallbackInitials: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!cloudinaryConfigured) {
      setError("Image uploads aren't configured yet.");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", UPLOAD_PRESET!);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: form }
      );
      const data = await res.json();
      if (!res.ok || !data.secure_url) {
        setError(data.error?.message ?? "Upload failed.");
        return;
      }
      onChange(data.secure_url);
    } catch {
      setError("Upload failed. Check your connection.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="size-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-orange-500 flex items-center justify-center text-lg font-semibold text-white overflow-hidden">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          fallbackInitials
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || !cloudinaryConfigured}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm hover:bg-white/15 transition disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Upload className="size-3.5" />
          )}
          {value ? "Change photo" : "Upload photo"}
        </button>
        {!cloudinaryConfigured && (
          <p className="mt-1.5 text-xs text-white/40">
            Add Cloudinary keys to <code>.env.local</code> to enable uploads.
          </p>
        )}
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onFile}
          className="hidden"
        />
      </div>
    </div>
  );
}
