"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";

import {
  PLANS,
  TIERS,
  priceFor,
  type BillingCycle,
  type Tier,
} from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

export default function BillingView({
  tier,
  cycle: currentCycle,
}: {
  tier: Tier;
  cycle: BillingCycle;
}) {
  const router = useRouter();
  const [cycle, setCycle] = useState<BillingCycle>(currentCycle);
  const [currentTier, setCurrentTier] = useState<Tier>(tier);
  const [loadingTier, setLoadingTier] = useState<Tier | null>(null);

  async function selectPlan(targetTier: Tier) {
    if (targetTier === currentTier) return;
    setLoadingTier(targetTier);
    try {
      const res = await fetch("/api/billing/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: targetTier, cycle }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error ?? "Could not change plan.");
        return;
      }
      setCurrentTier(targetTier);
      router.refresh();
    } catch {
      alert("Network error. Try again.");
    } finally {
      setLoadingTier(null);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Your plan</h1>
        <p className="mt-1 text-white/60">
          Every plan is free while Reppod is in early access — switch anytime.
        </p>
      </div>

      {/* Current plan */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex items-center justify-between">
        <div>
          <span className="text-xs text-white/50">Current plan</span>
          <p className="text-lg font-semibold text-white">
            {PLANS[currentTier].name}
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/15 text-emerald-300">
          Active · Free
        </span>
      </div>

      {/* Cycle toggle */}
      <div className="flex justify-center">
        <div className="relative inline-flex p-1 rounded-full border border-white/10 bg-white/5">
          {(["monthly", "yearly"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={cn(
                "relative px-5 py-1.5 text-sm rounded-full transition-colors",
                cycle === c ? "text-black" : "text-white/70"
              )}
            >
              {cycle === c && (
                <motion.span
                  layoutId="billing-cycle-pill"
                  className="absolute inset-0 rounded-full bg-white"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">
                {c === "yearly" ? "Yearly · save 20%" : "Monthly"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIERS.map((t) => {
          const plan = PLANS[t];
          const isCurrent = t === currentTier;
          const price = priceFor(t, cycle);
          return (
            <div
              key={t}
              className={cn(
                "relative rounded-2xl border bg-white/[0.03] p-6",
                plan.popular ? "border-fuchsia-500/40" : "border-white/10"
              )}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <p className="mt-1 text-xs text-white/50">{plan.tagline}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">${price}</span>
                <span className="text-white/50 text-sm">/mo</span>
              </div>

              <button
                onClick={() => selectPlan(t)}
                disabled={isCurrent || loadingTier !== null}
                className={cn(
                  "w-full mt-5 py-2.5 rounded-full text-sm font-medium transition inline-flex items-center justify-center gap-2 disabled:opacity-60",
                  isCurrent
                    ? "bg-white/10 text-white/60 cursor-default"
                    : plan.popular
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-white/10 text-white hover:bg-white/15"
                )}
              >
                {loadingTier === t && <Loader2 className="size-3.5 animate-spin" />}
                {isCurrent ? "Current plan" : <><Sparkles className="size-3.5" /> Switch to {plan.name}</>}
              </button>

              <ul className="mt-6 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                    <Check className="size-4 mt-0.5 text-fuchsia-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
