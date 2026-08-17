"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ClipboardList,
  Dumbbell,
  MessageSquare,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

type Notification = {
  id: string;
  type: "message" | "session_logged" | "workout_assigned" | "invite_accepted";
  title: string;
  body?: string;
  link?: string;
  read: boolean;
  createdAt: string;
};

const ICONS: Record<Notification["type"], LucideIcon> = {
  message: MessageSquare,
  session_logged: ClipboardList,
  workout_assigned: Dumbbell,
  invite_accepted: UserCheck,
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.notifications);
      setUnread(data.unread);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void load(), 0);
    const interval = window.setInterval(() => void load(), 30000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [load]);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      setUnread(0);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      try {
        await fetch("/api/notifications", { method: "PATCH" });
      } catch {
        // ignore
      }
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className="relative p-2 rounded-full hover:bg-white/5 transition"
        aria-label="Notifications"
      >
        <Bell className="size-4 text-white/70" />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-fuchsia-500 text-[10px] font-medium text-white flex items-center justify-center"
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button
              className="fixed inset-0 z-30 cursor-default"
              onClick={() => setOpen(false)}
              tabIndex={-1}
              aria-label="Close notifications"
            />
            <motion.div
              initial={{ y: 8, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 8, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-40 w-80 max-h-96 overflow-y-auto rounded-xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-2xl origin-top-right"
            >
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-sm font-semibold text-white">Notifications</p>
              </div>
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-white/40">
                  You&apos;re all caught up 🎉
                </p>
              ) : (
                <ul>
                  {items.map((n) => {
                    const Icon = ICONS[n.type];
                    const content = (
                      <div className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition">
                        <div className="size-8 shrink-0 rounded-lg bg-white/5 flex items-center justify-center">
                          <Icon className="size-4 text-fuchsia-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white">{n.title}</p>
                          {n.body && (
                            <p className="text-xs text-white/50 truncate">
                              {n.body}
                            </p>
                          )}
                          <p className="text-[10px] text-white/30 mt-0.5">
                            {new Date(n.createdAt).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                    return (
                      <li
                        key={n.id}
                        className="border-b border-white/5 last:border-0"
                      >
                        {n.link ? (
                          <Link href={n.link} onClick={() => setOpen(false)}>
                            {content}
                          </Link>
                        ) : (
                          content
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
