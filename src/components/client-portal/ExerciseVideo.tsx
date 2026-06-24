"use client";

import { useRef, useState } from "react";
import { Check } from "lucide-react";

/**
 * Plays an exercise demo video and reports watch progress back to the server.
 * Tracks the furthest point reached and throttles POSTs to every ~5s while
 * playing, plus a final flush on pause/ended.
 */
export default function ExerciseVideo({
  workoutId,
  exerciseId,
  videoUrl,
  initialPercent = 0,
  initialCompleted = false,
}: {
  workoutId: string;
  exerciseId: string;
  videoUrl: string;
  initialPercent?: number;
  initialCompleted?: boolean;
}) {
  const [percent, setPercent] = useState(initialPercent);
  const [completed, setCompleted] = useState(initialCompleted);
  const furthestRef = useRef(0);
  const lastSentRef = useRef(0);

  async function report(watchedSeconds: number, duration: number) {
    try {
      const res = await fetch("/api/me/video-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workoutId, exerciseId, watchedSeconds, duration }),
      });
      if (res.ok) {
        const data = await res.json();
        setPercent(data.progress.percent);
        setCompleted(data.progress.completed);
      }
    } catch {
      // best-effort; will retry on next tick
    }
  }

  function onTimeUpdate(e: React.SyntheticEvent<HTMLVideoElement>) {
    const el = e.currentTarget;
    furthestRef.current = Math.max(furthestRef.current, el.currentTime);
    // Throttle: send at most once every 5 seconds of playback.
    if (el.currentTime - lastSentRef.current >= 5) {
      lastSentRef.current = el.currentTime;
      report(furthestRef.current, el.duration || 0);
    }
  }

  function flush(e: React.SyntheticEvent<HTMLVideoElement>) {
    const el = e.currentTarget;
    furthestRef.current = Math.max(furthestRef.current, el.currentTime);
    report(furthestRef.current, el.duration || 0);
  }

  return (
    <div className="mt-3">
      <div className="relative">
        <video
          src={videoUrl}
          controls
          preload="metadata"
          onTimeUpdate={onTimeUpdate}
          onPause={flush}
          onEnded={flush}
          className="w-full max-h-64 rounded-lg bg-black"
        />
        {completed && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[11px] font-medium">
            <Check className="size-3" />
            Watched
          </span>
        )}
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-fuchsia-500 to-orange-500 transition-all"
            style={{ width: `${Math.round(percent * 100)}%` }}
          />
        </div>
        <span className="text-[11px] text-white/40">
          {Math.round(percent * 100)}% watched
        </span>
      </div>
    </div>
  );
}
