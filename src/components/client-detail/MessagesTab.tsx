"use client";

import type { SerializedMessage } from "@/lib/schemas/progress";
import MessageThread from "@/components/messaging/MessageThread";

export default function MessagesTab({
  clientId,
  clientName,
  hasAccount,
  initialMessages,
}: {
  clientId: string;
  clientName: string;
  hasAccount: boolean;
  initialMessages: SerializedMessage[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white">Messages</h2>
        <p className="text-sm text-white/50">
          {hasAccount
            ? `Chat directly with ${clientName}.`
            : `${clientName} hasn't joined yet — they'll see these once they accept their invite.`}
        </p>
      </div>

      <MessageThread
        endpoint={`/api/clients/${clientId}/messages`}
        viewerRole="trainer"
        initialMessages={initialMessages}
        emptyHint={`Start the conversation with ${clientName}.`}
      />
    </div>
  );
}
