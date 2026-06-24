"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, MoreVertical, Pencil, Trash2, Loader2 } from "lucide-react";
import type { SerializedClient } from "@/lib/schemas/client";
import { GOAL_LABELS, STATUS_LABELS } from "@/lib/schemas/client";
import { cn } from "@/lib/utils";

const statusStyles: Record<SerializedClient["status"], string> = {
  active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  paused: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  archived: "bg-white/10 text-white/50 border-white/15",
};

export default function ClientCard({
  client,
  onEdit,
  onDeleted,
}: {
  client: SerializedClient;
  onEdit: () => void;
  onDeleted: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);

  async function copyInviteLink() {
    setMenuOpen(false);
    setCopying(true);
    try {
      // Always fetch a fresh token from the server — this also backfills
      // clients created before invite tokens existed.
      const res = await fetch(`/api/clients/${client.id}/invite`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.token) {
        alert(data.error ?? "Could not generate an invite link.");
        return;
      }
      const url = `${window.location.origin}/invite/${data.token}`;
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        window.prompt("Copy this invite link:", url);
      }
    } catch {
      alert("Network error. Try again.");
    } finally {
      setCopying(false);
    }
  }

  const initials = client.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function onDelete() {
    if (!confirm(`Remove ${client.name} from your client list?`)) return;
    setDeleting(true);
    setMenuOpen(false);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onDeleted(client.id);
      } else {
        setDeleting(false);
        alert("Could not delete client. Try again.");
      }
    } catch {
      setDeleting(false);
      alert("Network error. Try again.");
    }
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-white/20 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="size-11 shrink-0 rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-500 flex items-center justify-center text-sm font-medium text-white">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <Link
            href={`/dashboard/clients/${client.id}`}
            className="font-semibold text-white hover:text-fuchsia-300 transition truncate block"
          >
            {client.name}
          </Link>
          <p className="text-xs text-white/50 truncate">
            {client.email ?? "No email"}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition"
            aria-label="Client menu"
          >
            <MoreVertical className="size-4" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                <button
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                  tabIndex={-1}
                />
                <motion.div
                  initial={{ y: 6, opacity: 0, scale: 0.96 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 6, opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1 z-20 w-40 rounded-lg border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-2xl py-1 origin-top-right"
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-white/80 hover:bg-white/5 transition"
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </button>
                  {client.inviteStatus === "pending" && client.inviteToken && (
                    <button
                      onClick={copyInviteLink}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-white/80 hover:bg-white/5 transition"
                    >
                      <Copy className="size-3.5" />
                      Copy invite link
                    </button>
                  )}
                  <button
                    onClick={onDelete}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/10 transition"
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-xs border",
            statusStyles[client.status]
          )}
        >
          {STATUS_LABELS[client.status]}
        </span>
        <span className="text-xs text-white/50">
          {GOAL_LABELS[client.goal]}
        </span>
        {client.inviteStatus === "accepted" ? (
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-emerald-300/80">
            <Check className="size-3" />
            Joined
          </span>
        ) : (
          <button
            onClick={copyInviteLink}
            disabled={copying}
            className="ml-auto inline-flex items-center gap-1 text-xs text-fuchsia-300/80 hover:text-fuchsia-200 transition disabled:opacity-60"
          >
            {copying ? (
              <>
                <Loader2 className="size-3 animate-spin" />
                Copying…
              </>
            ) : copied ? (
              <>
                <Check className="size-3" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="size-3" />
                Invite link
              </>
            )}
          </button>
        )}
      </div>

      {deleting && (
        <div className="absolute inset-0 rounded-2xl bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="size-5 text-white animate-spin" />
        </div>
      )}
    </motion.li>
  );
}
