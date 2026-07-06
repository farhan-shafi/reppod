"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";

import {
  PLANS,
  TIERS,
  priceFor,
  type BillingCycle,
  type Tier,
} from "@/lib/billing/plans";
import {
  CURRENCY_CODES,
  formatPrice,
  guessCurrencyFromBrowser,
  type CurrencyCode,
} from "@/lib/currency";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  trialing: "Trial",
  active: "Active",
  canceled: "Canceled",
  past_due: "Past due",
};

export default function BillingView({
  tier,
  status,
  cycle: currentCycle,
  trialDaysLeft,
  clientCount,
  maxClients,
  mock,
}: {
  tier: Tier;
  status: string;
  cycle: BillingCycle;
  trialDaysLeft: number;
  clientCount: number;
  maxClients: number;
  mock: boolean;
}) {
  const [cycle, setCycle] = useState<BillingCycle>(currentCycle);
  const [loadingTier, setLoadingTier] = useState<Tier | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode>("USD");

  useEffect(() => {
    setCurrency(guessCurrencyFromBrowser());
  }, []);

  const capLabel = Number.isFinite(maxClients) ? maxClients : "Unlimited";
  const usagePct = Number.isFinite(maxClients)
    ? Math.min(100, Math.round((clientCount / maxClients) * 100))
    : 0;

  async function checkout(targetTier: Tier) {
    setLoadingTier(targetTier);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: targetTier, cycle }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        alert(data.error ?? "Could not start checkout.");
        setLoadingTier(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      alert("Network error. Try again.");
      setLoadingTier(null);
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Billing</h1>
        <p className="mt-1 text-white/60">Manage your Reppod subscription.</p>
      </div>

      {/* Current plan */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">
                {PLANS[tier].name} plan
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/70">
                {STATUS_LABEL[status] ?? status}
              </span>
            </div>
            {status === "trialing" && (
              <p className="mt-1 text-sm text-fuchsia-300">
                {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"} left in your Pro trial
              </p>
            )}
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Clients</span>
            <span className="text-white/80">
              {clientCount} / {capLabel}
            </span>
          </div>
          {Number.isFinite(maxClients) && (
            <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-orange-500"
                style={{ width: `${usagePct}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {mock && (
        <p className="text-xs text-white/40 -mt-4">
          Demo mode — checkout is simulated, no real payment is taken.
        </p>
      )}

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
          const isCurrent = t === tier && status !== "trialing";
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
                <span className="text-4xl font-bold text-white">
                  {formatPrice(price, currency)}
                </span>
                <span className="text-white/50 text-sm">/mo</span>
              </div>

              <button
                onClick={() => checkout(t)}
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
                {isCurrent ? "Current plan" : <><Sparkles className="size-3.5" /> Choose {plan.name}</>}
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
