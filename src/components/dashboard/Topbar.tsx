"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { CreditCard, LogOut, Search, Settings, User as UserIcon } from "lucide-react";
import { useState } from "react";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function Topbar({
  user,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const [open, setOpen] = useState(false);
  const initials = (user.name ?? user.email ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-white/10 bg-black/60 backdrop-blur-xl flex items-center justify-between px-6">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <Search className="size-4 text-white/40" />
        <input
          placeholder="Search clients, workouts…"
          className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />

        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-white/5 transition"
          >
            <span className="size-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-500 flex items-center justify-center text-xs font-medium text-white overflow-hidden">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="" className="size-full object-cover" />
              ) : (
                initials
              )}
            </span>
            <span className="text-sm text-white/80 hidden sm:block">
              {user.name ?? user.email}
            </span>
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ y: 8, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 8, opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-2xl py-1.5 origin-top-right"
              >
                <div className="px-3 py-2 border-b border-white/10">
                  <p className="text-sm font-medium text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-white/50 truncate">{user.email}</p>
                </div>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 transition"
                >
                  <UserIcon className="size-4" />
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 transition"
                >
                  <Settings className="size-4" />
                  Settings
                </Link>
                <Link
                  href="/dashboard/billing"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 transition"
                >
                  <CreditCard className="size-4" />
                  Billing
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 transition"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
