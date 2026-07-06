import { requireUser } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/mongoose";
import { Client } from "@/models/Client";
import type { SerializedClient } from "@/lib/schemas/client";
import ClientsView from "./ClientsView";

export const metadata = {
  title: "Clients · Reppod",
};

export default async function ClientsPage() {
  const user = await requireUser();
  await connectDB();

  const docs = await Client.find({ trainer: user.id })
    .sort({ createdAt: -1 })
    .lean();

  const clients: SerializedClient[] = docs.map(({ _id, trainer, ...rest }) => ({
    id: String(_id),
    trainer: String(trainer),
    ...(rest as Omit<SerializedClient, "id" | "trainer">),
  }));

  return <ClientsView initialClients={clients} />;
}
