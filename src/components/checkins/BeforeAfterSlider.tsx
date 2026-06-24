"use client";

import { useRef, useState } from "react";

/**
 * Draggable before/after image comparison. The "after" image is revealed over
 * the "before" image by dragging the handle. No external library.
 */
export default function BeforeAfterSlider({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
}: {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function update(clientX: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[3/4] max-h-96 overflow-hidden rounded-2xl border border-white/10 bg-black select-none touch-none"
      onPointerDown={(e) => {
        dragging.current = true;
        update(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && update(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerLeave={() => (dragging.current = false)}
    >
      {/* before (full) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={before} alt={beforeLabel} className="absolute inset-0 size-full object-cover" />
      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[11px]">
        {beforeLabel}
      </span>

      {/* after (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={after} alt={afterLabel} className="absolute inset-0 size-full object-cover" />
        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-fuchsia-500/80 text-white text-[11px]">
          {afterLabel}
        </span>
      </div>

      {/* handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/80 cursor-ew-resize"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 rounded-full bg-white shadow-lg flex items-center justify-center">
          <span className="text-black text-xs">⇄</span>
        </div>
      </div>
    </div>
  );
}
