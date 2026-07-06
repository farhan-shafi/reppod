"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "Do my clients need to download an app?",
    a: "No. Clients get their own web portal via an invite link — they set a password and can log workouts, track macros, submit check-ins, and message you from any device. Add it to their home screen for an app-like feel.",
  },
  {
    q: "Can I try it before paying?",
    a: "Yes — every plan includes a 14-day free trial, no credit card required. You can also click ‘Try the live demo’ to explore a fully populated account right now.",
  },
  {
    q: "What can I do with Reppod?",
    a: "Build workouts with drag-and-drop and demo videos, create nutrition plans with macro targets, assign both to clients, track progress with charts and before/after photos, run weekly check-ins, and message clients — all in one place.",
  },
  {
    q: "How does billing work?",
    a: "Pick Starter, Pro, or Studio, billed monthly or yearly. Upgrade, downgrade, or cancel anytime from your billing dashboard. Pricing scales with your client count, not hidden add-ons.",
  },
  {
    q: "Is my clients' data private?",
    a: "Each trainer only ever sees their own clients, and clients only see their own data. Passwords are hashed, and every account is isolated.",
  },
  {
    q: "Can I import my existing clients?",
    a: "Add clients in seconds and send each an invite link. Bulk import is on the roadmap — reach out and we'll help you migrate.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-fuchsia-400">
            Questions
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-white">
            Everything you need to know
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-medium text-white">{f.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0 text-white/50"
                  >
                    <Plus className="size-5" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="px-5 pb-5 text-sm text-white/60 leading-relaxed">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
