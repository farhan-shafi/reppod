import { requireClient } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/mongoose";
import { Message } from "@/models/Message";
import { User } from "@/models/User";
import type { SerializedMessage } from "@/lib/schemas/progress";
import MessageThread from "@/components/messaging/MessageThread";

export const metadata = { title: "Messages · Reppod" };

export default async function ClientMessagesPage() {
  const { client } = await requireClient();
  await connectDB();

  const [docs, trainer] = await Promise.all([
    Message.find({ client: client._id }).sort({ createdAt: 1 }).lean(),
    User.findById(client.trainer).select("name businessName").lean<{
      name: string;
      businessName?: string;
    } | null>(),
  ]);

  const messages: SerializedMessage[] = docs.map((m) => ({
    id: String(m._id),
    senderRole: m.senderRole,
    body: m.body,
    createdAt: m.createdAt,
  }));

  const coachName = trainer?.businessName || trainer?.name || "your coach";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Messages
        </h1>
        <p className="mt-1 text-white/60">Chat with {coachName}.</p>
      </div>

      <MessageThread
        endpoint="/api/me/messages"
        viewerRole="client"
        initialMessages={messages}
        emptyHint={`Say hi to ${coachName} 👋`}
      />
    </div>
  );
}
