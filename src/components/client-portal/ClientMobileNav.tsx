"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LineChart, MessageSquare, Settings, Utensils } from "lucide-react";

const items = [
  { href: "/app", label: "Today", icon: Home },
  { href: "/app/nutrition", label: "Nutrition", icon: Utensils },
  { href: "/app/progress", label: "Progress", icon: LineChart },
  { href: "/app/messages", label: "Messages", icon: MessageSquare },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export default function ClientMobileNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-black/80 backdrop-blur-xl">
      <ul className="flex">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/app" && pathname.startsWith(item.href));
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-[10px] ${
                  active ? "text-white" : "text-white/50"
                }`}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
