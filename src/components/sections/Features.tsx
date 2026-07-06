"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { MouseEvent, useRef } from "react";
import {
  Calendar,
  Dumbbell,
  LineChart,
  MessageSquare,
  Salad,
  Trophy,
} from "lucide-react";

const features = [
  {
    icon: Dumbbell,
    title: "Drag-and-drop workout builder",
    desc: "Build programs in minutes. Save templates. Reuse across clients.",
    gradient: "from-fuchsia-500 to-pink-500",
  },
  {
    icon: LineChart,
    title: "Live progress tracking",
    desc: "Strength curves, body measurements, and PRs in one beautiful dashboard.",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: Salad,
    title: "AI-powered meal plans",
    desc: "Generate calorie-targeted meals tailored to each client's goals.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: MessageSquare,
    title: "In-app chat & check-ins",
    desc: "Voice notes, form-check videos, and weekly photo reviews.",
    gradient: "from-sky-500 to-indigo-500",
  },
  {
    icon: Calendar,
    title: "Smart session scheduler",
    desc: "Auto-reminders, calendar sync, and one-tap reschedules.",
    gradient: "from-violet-500 to-fuchsia-500",
  },
  {
    icon: Trophy,
    title: "Streaks & achievements",
    desc: "Gamify consistency. Clients stay 3x longer. (We measured.)",
    gradient: "from-rose-500 to-orange-500",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-fuchsia-400">
            Everything you need
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-white">
            The coaching toolkit, reimagined
          </h2>
          <p className="mt-4 text-white/60 text-lg">
            Stop stitching together Google Sheets, WhatsApp, and Notion. Reppod
            replaces them all.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

type Feature = (typeof features)[number] & { index: number };

function FeatureCard({ icon: Icon, title, desc, gradient, index }: Feature) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), {
    stiffness: 200,
    damping: 20,
  });

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.div
      ref={ref}
      initial={{ y: 40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.06 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className="group relative p-6 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-white/20 transition-colors"
    >
      <div
        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${gradient} blur-2xl -z-10`}
        style={{ filter: "blur(40px)" }}
      />

      <div
        className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-4 shadow-lg`}
      >
        <Icon className="size-5 text-white" />
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/60 leading-relaxed">{desc}</p>
    </motion.div>
  );
}
