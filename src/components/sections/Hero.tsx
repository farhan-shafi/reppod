"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { y: 24, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const yReverse = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16"
    >
      {/* gradient blobs */}
      <motion.div
        aria-hidden
        style={{ y }}
        className="absolute -top-32 -left-32 w-[40rem] h-[40rem] rounded-full bg-fuchsia-600/30 blur-[120px]"
      />
      <motion.div
        aria-hidden
        style={{ y: yReverse }}
        className="absolute -bottom-32 -right-32 w-[40rem] h-[40rem] rounded-full bg-orange-500/30 blur-[120px]"
      />

      {/* grid bg */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

      <motion.div
        style={{ opacity }}
        className="relative z-10 max-w-5xl mx-auto px-6 text-center"
      >
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center"
        >
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur text-xs text-white/80 mb-6"
          >
            <Sparkles className="size-3.5 text-fuchsia-400" />
            <span>Now with AI-generated workout plans</span>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.05]"
          >
            Train smarter.
            <br />
            <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Scale your coaching.
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl"
          >
            The all-in-one platform personal trainers use to deliver workouts,
            track progress, and grow their client base — without juggling 5 apps.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/sign-up"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-medium shadow-2xl shadow-fuchsia-500/20"
              >
                Start free trial
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/5"
            >
              <Play className="size-4" />
              Watch demo
            </motion.a>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-12 flex items-center gap-6 text-xs text-white/50"
          >
            <span>14-day free trial</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>No credit card required</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Cancel anytime</span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* floating dumbbells */}
      <FloatingDumbbell className="top-1/4 left-[8%]" delay={0} />
      <FloatingDumbbell className="top-1/3 right-[10%]" delay={1.2} />
      <FloatingDumbbell className="bottom-1/4 left-[15%]" delay={0.6} />
    </section>
  );
}

function FloatingDumbbell({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 64 64"
      className={`absolute size-10 text-white/15 ${className}`}
      animate={{ y: [0, -20, 0], rotate: [0, 12, -8, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
      fill="currentColor"
    >
      <rect x="6" y="26" width="6" height="12" rx="2" />
      <rect x="14" y="22" width="4" height="20" rx="1.5" />
      <rect x="18" y="30" width="28" height="4" rx="1" />
      <rect x="46" y="22" width="4" height="20" rx="1.5" />
      <rect x="52" y="26" width="6" height="12" rx="2" />
    </motion.svg>
  );
}
