"use client";

import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import {
  clientCreateSchema,
  CLIENT_GOALS,
  CLIENT_STATUSES,
  GOAL_LABELS,
  STATUS_LABELS,
  type SerializedClient,
} from "@/lib/schemas/client";

type State =
  | { mode: "create" }
  | { mode: "edit"; client: SerializedClient }
  | null;

type FormValues = {
  name: string;
  email: string;
  phone: string;
  goal: (typeof CLIENT_GOALS)[number];
  status: (typeof CLIENT_STATUSES)[number];
  notes: string;
};

const emptyForm: FormValues = {
  name: "",
  email: "",
  phone: "",
  goal: "general_fitness",
  status: "active",
  notes: "",
};

function initialForm(state: State): FormValues {
  if (state?.mode !== "edit") return emptyForm;
  return {
    name: state.client.name,
    email: state.client.email ?? "",
    phone: state.client.phone ?? "",
    goal: state.client.goal,
    status: state.client.status,
    notes: state.client.notes ?? "",
  };
}

export default function ClientFormModal({
  state,
  onClose,
  onCreated,
  onUpdated,
}: {
  state: State;
  onClose: () => void;
  onCreated: (client: SerializedClient) => void;
  onUpdated: (client: SerializedClient) => void;
}) {
  const [form, setForm] = useState<FormValues>(() => initialForm(state));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onClose();
    }
    if (state) {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [state, loading, onClose]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = clientCreateSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    try {
      if (state?.mode === "edit") {
        const res = await fetch(`/api/clients/${state.client.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "Could not update client.");
          return;
        }
        onUpdated(data.client);
      } else {
        const res = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data.error ?? "Could not create client.");
          return;
        }
        onCreated(data.client);
      }
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {state && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => !loading && onClose()}
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              disabled={loading}
              className="absolute top-4 right-4 p-1 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition disabled:opacity-50"
              aria-label="Close"
            >
              <X className="size-5" />
            </button>

            <h2 className="text-xl font-bold text-white">
              {state.mode === "edit" ? "Edit client" : "New client"}
            </h2>
            <p className="mt-1 text-sm text-white/60">
              {state.mode === "edit"
                ? "Update this client's details."
                : "Add someone to your roster."}
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <Field
                label="Name"
                required
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                placeholder="Alex Johnson"
                autoFocus
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  placeholder="alex@example.com"
                />
                <Field
                  label="Phone"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                  placeholder="+1 555 123 4567"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Goal"
                  value={form.goal}
                  onChange={(v) =>
                    setForm({ ...form, goal: v as FormValues["goal"] })
                  }
                  options={CLIENT_GOALS.map((g) => ({
                    value: g,
                    label: GOAL_LABELS[g],
                  }))}
                />
                <Select
                  label="Status"
                  value={form.status}
                  onChange={(v) =>
                    setForm({ ...form, status: v as FormValues["status"] })
                  }
                  options={CLIENT_STATUSES.map((s) => ({
                    value: s,
                    label: STATUS_LABELS[s],
                  }))}
                />
              </div>
              <TextArea
                label="Notes"
                value={form.notes}
                onChange={(v) => setForm({ ...form, notes: v })}
                placeholder="Any context worth remembering — injuries, goals, preferences…"
              />

              {error && (
                <motion.p
                  initial={{ y: -6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-sm text-red-400"
                >
                  {error}
                </motion.p>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 rounded-full text-sm text-white/80 hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition inline-flex items-center gap-2 disabled:opacity-60"
                >
                  {loading && <Loader2 className="size-3.5 animate-spin" />}
                  {state.mode === "edit" ? "Save changes" : "Add client"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-white/50">
        {label}
      </span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm outline-none focus:border-fuchsia-500/50 focus:bg-white/[0.07] transition"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
>) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-white/50">
        {label}
      </span>
      <textarea
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm outline-none focus:border-fuchsia-500/50 focus:bg-white/[0.07] transition resize-none"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-white/50">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-fuchsia-500/50 transition"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-zinc-900">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
