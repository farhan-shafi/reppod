"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Sparkles, X } from "lucide-react";

export default function OnboardingChecklist({
  businessName,
  hasClients,
  hasWorkouts,
}: {
  businessName?: string;
  hasClients: boolean;
  hasWorkouts: boolean;
}) {
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState(businessName ?? "");
  const [savedName, setSavedName] = useState(Boolean(businessName));
  const [saving, setSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const steps = [
    { key: "brand", label: "Set your business name", done: savedName },
    { key: "client", label: "Add your first client", done: hasClients },
    { key: "workout", label: "Build your first workout", done: hasWorkouts },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  if (dismissed || doneCount === steps.length) return null;

  async function saveName() {
    if (name.trim().length < 2) return;
    setSaving(true);
    try {
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: name.trim() }),
      });
      if (res.ok) {
        setSavedName(true);
        await update({}).catch(() => {});
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error ?? "Could not save.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        className="relative rounded-2xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-500/10 to-orange-500/5 p-6"
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 p-1 rounded-md text-white/40 hover:text-white hover:bg-white/5 transition"
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-fuchsia-300" />
          <h2 className="font-semibold text-white">
            Get set up ({doneCount}/{steps.length})
          </h2>
        </div>
        <p className="mt-1 text-sm text-white/60">
          A few quick steps to get your coaching business running.
        </p>

        <ul className="mt-5 space-y-3">
          {/* Step 1: business name */}
          <li className="flex items-center gap-3">
            <StepDot done={savedName} />
            {savedName ? (
              <span className="text-sm text-white/70">
                Business name set{name ? ` — ${name}` : ""}
              </span>
            ) : (
              <div className="flex-1 flex items-center gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your business name (shown to clients)"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-fuchsia-500/50 transition"
                />
                <button
                  onClick={saveName}
                  disabled={saving || name.trim().length < 2}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition disabled:opacity-50"
                >
                  {saving && <Loader2 className="size-3.5 animate-spin" />}
                  Save
                </button>
              </div>
            )}
          </li>

          {/* Step 2: first client */}
          <li className="flex items-center gap-3">
            <StepDot done={hasClients} />
            {hasClients ? (
              <span className="text-sm text-white/70">First client added</span>
            ) : (
              <Link
                href="/dashboard/clients"
                className="text-sm text-fuchsia-300 hover:text-fuchsia-200 transition"
              >
                Add your first client →
              </Link>
            )}
          </li>

          {/* Step 3: first workout */}
          <li className="flex items-center gap-3">
            <StepDot done={hasWorkouts} />
            {hasWorkouts ? (
              <span className="text-sm text-white/70">First workout built</span>
            ) : (
              <Link
                href="/dashboard/workouts/new"
                className="text-sm text-fuchsia-300 hover:text-fuchsia-200 transition"
              >
                Build your first workout →
              </Link>
            )}
          </li>
        </ul>
      </motion.div>
    </AnimatePresence>
  );
}

function StepDot({ done }: { done: boolean }) {
  return (
    <span
      className={`size-6 shrink-0 rounded-full flex items-center justify-center ${
        done ? "bg-emerald-500" : "border border-white/20"
      }`}
    >
      {done && <Check className="size-3.5 text-white" />}
    </span>
  );
}
