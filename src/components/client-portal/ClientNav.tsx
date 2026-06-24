"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  Dumbbell,
  Home,
  LineChart,
  LogOut,
  MessageSquare,
  Settings,
  type LucideIcon,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };

const items: NavItem[] = [
  { href: "/app", label: "Today", icon: Home },
  { href: "/app/progress", label: "Progress", icon: LineChart },
  { href: "/app/messages", label: "Messages", icon: MessageSquare },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export default function ClientNav({
  user,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const pathname = usePathname();
  const initials = (user.name ?? user.email ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-white/10 bg-white/[0.02] backdrop-blur-xl">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-white/10">
        <span className="p-1.5 rounded-lg bg-gradient-to-br from-fuchsia-500 to-orange-500">
          <Dumbbell className="size-4 text-white" />
        </span>
        <span className="font-bold tracking-tight text-white">FlexFlow</span>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/app" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm group"
            >
              {active && (
                <motion.span
                  layoutId="client-nav-active"
                  className="absolute inset-0 rounded-lg bg-white/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`relative flex items-center gap-3 ${
                  active ? "text-white" : "text-white/60 group-hover:text-white/90"
                } transition-colors`}
              >
                <item.icon className="size-4" />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2">
          <span className="size-9 rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-500 flex items-center justify-center text-xs font-medium text-white overflow-hidden">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="size-full object-cover" />
            ) : (
              initials
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white truncate">{user.name}</p>
            <p className="text-xs text-white/40 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
