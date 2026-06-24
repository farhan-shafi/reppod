import { NextResponse } from "next/server";
import { requireOwnedClient } from "@/lib/api-helpers";
import { Message } from "@/models/Message";
import { createNotification } from "@/models/Notification";
import {
  messageCreateSchema,
  type SerializedMessage,
} from "@/lib/schemas/progress";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const result = await requireOwnedClient(id);
  if ("error" in result) return result.error;

  const docs = await Message.find({ client: id }).sort({ createdAt: 1 }).lean();
  const messages: SerializedMessage[] = docs.map((d) => ({
    id: String(d._id),
    senderRole: d.senderRole,
    body: d.body,
    createdAt: d.createdAt,
  }));

  return NextResponse.json({ messages });
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const result = await requireOwnedClient(id);
  if ("error" in result) return result.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = messageCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const created = await Message.create({
    trainer: result.trainerId,
    client: id,
    sender: result.trainerId,
    senderRole: "trainer",
    body: parsed.data.body,
  });

  // Notify the client's user account if they've accepted the invite.
  if (result.client.user) {
    await createNotification({
      user: result.client.user,
      type: "message",
      title: "New message from your coach",
      body: parsed.data.body.slice(0, 80),
      link: "/app/messages",
    });
  }

  const message: SerializedMessage = {
    id: String(created._id),
    senderRole: "trainer",
    body: created.body,
    createdAt: created.createdAt,
  };

  return NextResponse.json({ message }, { status: 201 });
}
