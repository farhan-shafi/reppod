"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Play } from "lucide-react";

import {
  DEMO_COACH_EMAIL,
  DEMO_CLIENT_EMAIL,
  DEMO_PASSWORD,
} from "@/lib/demo";
import { cn } from "@/lib/utils";

export default function DemoLoginButton({
  role = "coach",
  label,
  variant = "outline",
  className,
}: {
  role?: "coach" | "client";
  label?: string;
  variant?: "outline" | "link";
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function tryDemo() {
    setLoading(true);
    const res = await signIn("credentials", {
      email: role === "client" ? DEMO_CLIENT_EMAIL : DEMO_COACH_EMAIL,
      password: DEMO_PASSWORD,
      redirect: false,
    });
    if (res?.error) {
      setLoading(false);
      alert("Demo is warming up — please try again in a moment.");
      return;
    }
    router.push(role === "client" ? "/app" : "/dashboard");
    router.refresh();
  }

  if (variant === "link") {
    return (
      <button
        onClick={tryDemo}
        disabled={loading}
        className={cn(
          "inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition disabled:opacity-60",
          className
        )}
      >
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
        {label ?? "Live demo"}
      </button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={tryDemo}
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/5 transition disabled:opacity-60",
        className
      )}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
      {label ?? (role === "client" ? "Try as a client" : "Try the live demo")}
    </motion.button>
  );
}
