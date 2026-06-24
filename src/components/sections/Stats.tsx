"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

const stats = [
  { value: 12500, suffix: "+", label: "Trainers using FlexFlow" },
  { value: 480000, suffix: "+", label: "Workouts delivered" },
  { value: 97, suffix: "%", label: "Client retention" },
  { value: 4.9, suffix: "/5", label: "Avg trainer rating", decimals: 1 },
];

export default function Stats() {
  return (
    <section
      id="stats"
      className="relative py-28 px-6 border-y border-white/10 bg-white/[0.02]"
    >
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center text-2xl md:text-3xl font-medium text-white/80 max-w-3xl mx-auto mb-16"
        >
          Trusted by coaches who don&apos;t have time for &ldquo;just one more spreadsheet.&rdquo;
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <Counter key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Counter({
  value,
  suffix,
  label,
  decimals = 0,
}: {
  value: number;
  suffix: string;
  label: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const count = useMotionValue(0);
  const display = useTransform(count, (v) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString()
  );

  useEffect(() => {
    if (inView) {
      const controls = animate(count, value, { duration: 1.8, ease: "easeOut" });
      return () => controls.stop();
    }
  }, [inView, value, count]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
        <motion.span>{display}</motion.span>
        <span>{suffix}</span>
      </div>
      <div className="mt-2 text-sm text-white/50">{label}</div>
    </div>
  );
}
