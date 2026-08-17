"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          router.push(
            `/sign-in?email=${encodeURIComponent(email)}&existing=1`
          );
          return;
        }
        setError(data.error ?? "Could not create account.");
        return;
      }

      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        router.push(
          `/sign-in?email=${encodeURIComponent(email)}&created=1`
        );
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      clearTimeout(timeout);
      if (err instanceof DOMException && err.name === "AbortError") {
        setError(
          "The request took too long. Check your connection and try again."
        );
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl shadow-fuchsia-500/5"
    >
      <h1 className="text-2xl font-bold text-white">Create your account</h1>
      <p className="mt-1 text-sm text-white/60">
        Start your 14-day free trial. No credit card needed.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field
          label="Name"
          type="text"
          value={name}
          onChange={setName}
          required
          autoComplete="name"
          placeholder="Alex Coach"
        />
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
          autoComplete="email"
          placeholder="you@example.com"
        />
        <Field
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={setPassword}
          required
          autoComplete="new-password"
          placeholder="10+ chars, upper/lowercase and number"
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-white/40 hover:text-white/80 transition"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          }
        />

        {error && (
          <motion.p
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          className="w-full py-2.5 rounded-full bg-white text-black font-medium hover:bg-white/90 transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          Create account
        </motion.button>
      </form>

      <p className="mt-6 text-center text-sm text-white/50">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-white hover:text-fuchsia-300 transition"
        >
          Sign in
        </Link>
      </p>
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
      <span className="text-xs uppercase tracking-wider text-white/50">
        {label}
      </span>
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
