"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  CURRENCY_CODES,
  formatPrice,
  guessCurrencyFromBrowser,
  type CurrencyCode,
} from "@/lib/currency";

const tiers = [
  {
    name: "Starter",
    monthly: 19,
    yearly: 15,
    features: [
      "Up to 10 clients",
      "Workout builder",
      "Progress tracking",
      "Email support",
    ],
    cta: "Start free",
  },
  {
    name: "Pro",
    monthly: 49,
    yearly: 39,
    popular: true,
    features: [
      "Unlimited clients",
      "Nutrition & meal plans",
      "In-app chat & video",
      "Card & wallet payments",
      "Priority support",
    ],
    cta: "Start 14-day trial",
  },
  {
    name: "Studio",
    monthly: 99,
    yearly: 79,
    features: [
      "Multi-trainer workspace",
      "Custom branding",
      "API access",
      "Dedicated CSM",
    ],
    cta: "Talk to sales",
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(true);
  const [currency, setCurrency] = useState<CurrencyCode>("USD");

  // Detect the visitor's likely currency on mount (browser locale).
  useEffect(() => {
    setCurrency(guessCurrencyFromBrowser());
  }, []);

  return (
    <section id="pricing" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="text-xs uppercase tracking-[0.2em] text-fuchsia-400">
            Simple pricing
          </span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight text-white">
            Pricing that scales with you
          </h2>
          <p className="mt-4 text-white/60 text-lg">
            Cancel anytime. No hidden fees. Yes, really.
          </p>
        </motion.div>

        <div className="flex flex-col items-center gap-4 mb-12">
          <div className="relative inline-flex p-1 rounded-full border border-white/10 bg-white/5">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                "relative px-5 py-1.5 text-sm rounded-full transition-colors",
                !yearly ? "text-black" : "text-white/70"
              )}
            >
              {!yearly && (
                <motion.span
                  layoutId="pricing-pill"
                  className="absolute inset-0 rounded-full bg-white"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">Monthly</span>
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                "relative px-5 py-1.5 text-sm rounded-full transition-colors",
                yearly ? "text-black" : "text-white/70"
              )}
            >
              {yearly && (
                <motion.span
                  layoutId="pricing-pill"
                  className="absolute inset-0 rounded-full bg-white"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">Yearly · save 20%</span>
            </button>
          </div>

          {/* Currency selector */}
          <label className="flex items-center gap-2 text-xs text-white/50">
            Show prices in
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-fuchsia-500/50"
            >
              {CURRENCY_CODES.map((c) => (
                <option key={c} value={c} className="bg-zinc-900">
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((t, i) => {
            const price = yearly ? t.yearly : t.monthly;
            return (
              <motion.div
                key={t.name}
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={cn(
                  "relative p-8 rounded-2xl border bg-white/[0.03] backdrop-blur-sm",
                  t.popular
                    ? "border-fuchsia-500/40 shadow-2xl shadow-fuchsia-500/10"
                    : "border-white/10"
                )}
              >
                {t.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white">
                    Most popular
                  </span>
                )}

                <h3 className="text-lg font-semibold text-white">{t.name}</h3>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-bold text-white">
                    <AnimatedPrice display={formatPrice(price, currency)} />
                  </span>
                  <span className="text-white/50">/mo</span>
                </div>
                <p className="mt-1 text-xs text-white/40">
                  {yearly ? "Billed annually" : "Billed monthly"}
                  {currency !== "USD" && " · approx, charged in your local currency"}
                </p>

                <Link
                  href="/sign-up"
                  className={cn(
                    "block w-full mt-6 py-2.5 rounded-full text-sm font-medium transition text-center",
                    t.popular
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-white/10 text-white hover:bg-white/15"
                  )}
                >
                  {t.cta}
                </Link>

                <ul className="mt-8 space-y-3">
                  {t.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-white/70"
                    >
                      <Check className="size-4 mt-0.5 text-fuchsia-400 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AnimatedPrice({ display }: { display: string }) {
  return (
    <span className="inline-block">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={display}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="inline-block"
        >
          {display}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
