"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Dumbbell,
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  type LucideIcon,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };

const items: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/workouts", label: "Workouts", icon: ClipboardList },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-white/10 bg-white/[0.02] backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-2 px-6 h-16 border-b border-white/10">
        <span className="p-1.5 rounded-lg bg-gradient-to-br from-fuchsia-500 to-orange-500">
          <Dumbbell className="size-4 text-white" />
        </span>
        <span className="font-bold tracking-tight text-white">FlexFlow</span>
      </Link>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm group"
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-white/10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`relative flex items-center gap-3 ${
                  active
                    ? "text-white"
                    : "text-white/60 group-hover:text-white/90"
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
        <div className="px-3 py-3 rounded-lg bg-gradient-to-br from-fuchsia-500/15 to-orange-500/10 border border-white/10">
          <p className="text-xs font-medium text-white">Trial · 13 days left</p>
          <p className="mt-1 text-xs text-white/50">
            Upgrade to keep unlimited clients.
          </p>
          <button className="mt-2 text-xs font-medium text-fuchsia-300 hover:text-fuchsia-200 transition">
            Upgrade →
          </button>
        </div>
      </div>
    </aside>
  );
}
