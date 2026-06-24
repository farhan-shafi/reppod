"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

import { PLANS, TIERS, type BillingCycle, type Tier } from "@/lib/billing/plans";

export default function BillingSuccess() {
  const router = useRouter();
  const params = useSearchParams();
  const tier = (params.get("tier") ?? "") as Tier;
  const cycle = (params.get("cycle") ?? "monthly") as BillingCycle;

  const [state, setState] = useState<"working" | "done" | "error">("working");

  useEffect(() => {
    if (!TIERS.includes(tier)) {
      setState("error");
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/billing/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier, cycle }),
        });
        if (!active) return;
        setState(res.ok ? "done" : "error");
        if (res.ok) router.refresh();
      } catch {
        if (active) setState("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [tier, cycle, router]);

  return (
    <div className="max-w-md mx-auto py-16 text-center">
      {state === "working" && (
        <div className="flex flex-col items-center gap-3 text-white/60">
          <Loader2 className="size-6 animate-spin" />
          Activating your subscription…
        </div>
      )}

      {state === "done" && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="size-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Check className="size-7 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">
            You&apos;re on {PLANS[tier]?.name ?? "your new plan"} 🎉
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Your subscription is active. Thanks for upgrading!
          </p>
          <Link
            href="/dashboard/billing"
            className="mt-6 inline-block px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition"
          >
            Back to billing
          </Link>
        </motion.div>
      )}

      {state === "error" && (
        <div className="flex flex-col items-center">
          <h1 className="text-xl font-bold text-white">Something went wrong</h1>
          <p className="mt-2 text-sm text-white/60">
            We couldn&apos;t activate that plan. Please try again from billing.
          </p>
          <Link
            href="/dashboard/billing"
            className="mt-6 inline-block px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition"
          >
            Back to billing
          </Link>
        </div>
      )}
    </div>
  );
}
