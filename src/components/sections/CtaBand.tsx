"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import DemoLoginButton from "@/components/DemoLoginButton";

export default function CtaBand() {
  return (
    <section className="relative py-24 px-6">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="relative max-w-5xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-500/15 to-orange-500/10 p-12 text-center overflow-hidden"
      >
        <div
          aria-hidden
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-fuchsia-600/30 blur-[100px]"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-orange-500/25 blur-[100px]"
        />
        <div className="relative">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Start coaching smarter today
          </h2>
          <p className="mt-4 text-white/70 max-w-xl mx-auto">
            Join coaches who run their whole business in one place. 14-day free
            trial — no credit card required.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-medium shadow-2xl shadow-fuchsia-500/20"
            >
              Start free trial
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <DemoLoginButton />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
