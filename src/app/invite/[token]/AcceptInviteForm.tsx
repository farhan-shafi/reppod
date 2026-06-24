"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dumbbell, Eye, EyeOff, Loader2 } from "lucide-react";

type InviteInfo = {
  clientName: string;
  email: string;
  trainerName: string;
};

export default function AcceptInviteForm({ token }: { token: string }) {
  const router = useRouter();
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/invite/${token}`)
      .then(async (r) => {
        const data = await r.json();
        if (!active) return;
        if (!r.ok) {
          setLoadError(data.error ?? "This invite link is invalid.");
        } else {
          setInfo(data);
          setName(data.clientName ?? "");
          setEmail(data.email ?? "");
        }
      })
      .catch(() => active && setLoadError("Could not load this invite."))
      .finally(() => active && setLoadingInfo(false));
    return () => {
      active = false;
    };
  }, [token]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/invite/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not accept invite.");
        return;
      }

      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signInRes?.error) {
        router.push("/sign-in");
        return;
      }
      router.push("/app");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingInfo) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-white/50" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 text-center">
        <h1 className="text-xl font-bold text-white">Invite unavailable</h1>
        <p className="mt-2 text-sm text-white/60">{loadError}</p>
        <Link
          href="/sign-in"
          className="mt-5 inline-block px-4 py-2 rounded-full bg-white text-black text-sm font-medium"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl shadow-fuchsia-500/5"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="p-1.5 rounded-lg bg-gradient-to-br from-fuchsia-500 to-orange-500">
          <Dumbbell className="size-4 text-white" />
        </span>
        <span className="font-bold tracking-tight text-white">FlexFlow</span>
      </div>

      <h1 className="text-2xl font-bold text-white">
        {info?.trainerName} invited you 🎉
      </h1>
      <p className="mt-1 text-sm text-white/60">
        Create your account to see your workouts and track your progress.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Your name" value={name} onChange={setName} required />
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
          autoComplete="email"
        />
        <Field
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={setPassword}
          required
          autoComplete="new-password"
          placeholder="At least 6 characters"
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-white/40 hover:text-white/80 transition"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={submitting}
          className="w-full py-2.5 rounded-full bg-white text-black font-medium hover:bg-white/90 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="size-4 animate-spin" />}
          Create account & continue
        </motion.button>
      </form>
    </motion.div>
  );
}

function Field({
  label,
  rightSlot,
  value,
  onChange,
  ...rest
}: {
  label: string;
  rightSlot?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-white/50">{label}</span>
      <div className="mt-1 relative">
        <input
          {...rest}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2.5 pr-10 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-fuchsia-500/50 focus:bg-white/[0.07] transition"
        />
        {rightSlot && (
          <span className="absolute inset-y-0 right-3 flex items-center">
            {rightSlot}
          </span>
        )}
      </div>
    </label>
  );
}
