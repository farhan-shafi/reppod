"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import DemoLoginButton from "@/components/DemoLoginButton";

const links = [
  { href: "#features", label: "Features" },
  { href: "#stats", label: "Results" },
  { href: "#pricing", label: "Pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-black/60 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 group">
          <motion.span
            whileHover={{ rotate: 12 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="p-1.5 rounded-lg bg-gradient-to-br from-fuchsia-500 to-orange-500"
          >
            <Dumbbell className="size-4 text-white" />
          </motion.span>
          <span className="font-bold text-lg tracking-tight text-white">
            FlexFlow
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm text-white/70 hover:text-white transition-colors relative group"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-fuchsia-500 to-orange-500 group-hover:w-full transition-all duration-300" />
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-4">
          <DemoLoginButton variant="link" />
          <Link
            href="/sign-in"
            className="text-sm text-white/80 hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="text-sm font-medium px-4 py-2 rounded-full bg-white text-black hover:bg-white/90 transition"
          >
            Start free
          </Link>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-black/80 backdrop-blur-xl border-t border-white/10"
          >
            <ul className="px-6 py-4 space-y-3">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block text-white/80 hover:text-white py-1"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/sign-in"
                  onClick={() => setOpen(false)}
                  className="block text-white/80 hover:text-white py-1"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-up"
                  onClick={() => setOpen(false)}
                  className="block w-full mt-2 px-4 py-2 rounded-full bg-white text-black font-medium text-center"
                >
                  Start free
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
