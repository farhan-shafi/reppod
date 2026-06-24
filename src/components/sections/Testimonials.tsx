"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "I dropped two apps and a spreadsheet. My clients log everything themselves now — I just review and coach.",
    name: "Jordan Rivera",
    role: "Online strength coach · 40 clients",
    initials: "JR",
  },
  {
    quote:
      "The before/after sliders and weight charts sell renewals for me. Clients see their progress and stay.",
    name: "Amara Okafor",
    role: "Physique coach",
    initials: "AO",
  },
  {
    quote:
      "Setup took an afternoon. The demo videos on each exercise cut my 'how do I do this' messages in half.",
    name: "Daniel Kim",
    role: "Personal trainer",
    initials: "DK",
  },
  {
    quote:
      "Nutrition plans + macro tracking in the same place as workouts. My clients finally stick to the plan.",
    name: "Sofia Marchetti",
    role: "Nutrition & fitness coach",
    initials: "SM",
  },
  {
    quote:
      "Recurring billing means predictable income. I went from chasing payments to actually coaching.",
    name: "Marcus Lee",
    role: "Studio owner · 6 trainers",
    initials: "ML",
  },
  {
    quote:
      "My clients love their own app. Check-ins, messages, progress photos — it feels premium.",
    name: "Priya Patel",
    role: "Transformation coach",
    initials: "PP",
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-fuchsia-400">
            Loved by coaches
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-white">
            Built for how you actually coach
          </h2>
          <div className="mt-4 flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2 text-sm text-white/60">
              4.9/5 from 1,200+ coaches
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="size-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="text-sm text-white/80 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="size-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-500 flex items-center justify-center text-xs font-medium text-white">
                  {t.initials}
                </span>
                <div>
                  <div className="text-sm font-medium text-white">{t.name}</div>
                  <div className="text-xs text-white/50">{t.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
