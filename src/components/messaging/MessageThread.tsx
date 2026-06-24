"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Send } from "lucide-react";

import type { SerializedMessage } from "@/lib/schemas/progress";

/**
 * Shared chat thread used by both the trainer (client detail) and the client
 * portal. `viewerRole` controls which bubbles render as "you" (right-aligned).
 */
export default function MessageThread({
  endpoint,
  viewerRole,
  initialMessages,
  emptyHint,
}: {
  endpoint: string;
  viewerRole: "trainer" | "client";
  initialMessages: SerializedMessage[];
  emptyHint: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  async function send(e: FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || sending) return;

    setSending(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error ?? "Could not send message.");
        return;
      }
      setMessages((prev) => [...prev, data.message]);
      setBody("");
    } catch {
      alert("Network error.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-[70vh] max-h-[640px] rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="py-12 text-center text-sm text-white/50">{emptyHint}</p>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              const mine = m.senderRole === viewerRole;
              return (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      mine
                        ? "bg-gradient-to-br from-fuchsia-500 to-orange-500 text-white rounded-br-sm"
                        : "bg-white/[0.07] text-white rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {m.body}
                    </p>
                    <p
                      className={`mt-1 text-[10px] ${
                        mine ? "text-white/70" : "text-white/40"
                      }`}
                    >
                      {new Date(m.createdAt).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <form
        onSubmit={send}
        className="flex items-end gap-2 p-3 border-t border-white/10"
      >
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(e as unknown as FormEvent);
            }
          }}
          rows={1}
          placeholder="Type a message…"
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-fuchsia-500/50 transition resize-none max-h-32"
        />
        <button
          type="submit"
          disabled={sending || body.trim().length === 0}
          className="inline-flex items-center justify-center size-10 rounded-xl bg-white text-black hover:bg-white/90 transition disabled:opacity-50 shrink-0"
        >
          {sending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </button>
      </form>
    </div>
  );
}
