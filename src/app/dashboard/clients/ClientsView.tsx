"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Users } from "lucide-react";
import type { SerializedClient } from "@/lib/schemas/client";
import ClientCard from "./ClientCard";
import ClientFormModal from "./ClientFormModal";

export default function ClientsView({
  initialClients,
}: {
  initialClients: SerializedClient[];
}) {
  const [clients, setClients] = useState(initialClients);
  const [query, setQuery] = useState("");
  const [modalState, setModalState] = useState<
    { mode: "create" } | { mode: "edit"; client: SerializedClient } | null
  >(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false)
    );
  }, [clients, query]);

  function onCreated(client: SerializedClient) {
    setClients((prev) => [client, ...prev]);
  }

  function onUpdated(client: SerializedClient) {
    setClients((prev) => prev.map((c) => (c.id === client.id ? client : c)));
  }

  function onDeleted(id: string) {
    setClients((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Clients
          </h1>
          <p className="mt-1 text-white/60">
            {clients.length === 0
              ? "Add your first client to start coaching."
              : `${clients.length} client${clients.length === 1 ? "" : "s"} in your roster.`}
          </p>
        </div>
        <button
          onClick={() => setModalState({ mode: "create" })}
          className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition self-start sm:self-auto"
        >
          + New client
        </button>
      </div>

      {clients.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm outline-none focus:border-fuchsia-500/50 focus:bg-white/[0.07] transition"
          />
        </div>
      )}

      {clients.length === 0 ? (
        <EmptyState onAdd={() => setModalState({ mode: "create" })} />
      ) : filtered.length === 0 ? (
        <p className="text-center py-12 text-white/50 text-sm">
          No clients match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <motion.ul
          layout
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onEdit={() => setModalState({ mode: "edit", client })}
                onDeleted={onDeleted}
              />
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <ClientFormModal
        key={
          modalState?.mode === "edit"
            ? `edit-${modalState.client.id}`
            : (modalState?.mode ?? "closed")
        }
        state={modalState}
        onClose={() => setModalState(null)}
        onCreated={onCreated}
        onUpdated={onUpdated}
      />
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center">
      <div className="mx-auto size-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-orange-500 flex items-center justify-center">
        <Users className="size-5 text-white" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-white">
        No clients yet
      </h2>
      <p className="mt-1 text-sm text-white/60 max-w-sm mx-auto">
        Add your first client to start assigning workouts and tracking progress.
      </p>
      <button
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition"
      >
        + New client
      </button>
    </div>
  );
}
