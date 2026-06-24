import { NextResponse } from "next/server";
import { requireClientUser } from "@/lib/api-helpers";
import { Message } from "@/models/Message";
import { createNotification } from "@/models/Notification";
import {
  messageCreateSchema,
  type SerializedMessage,
} from "@/lib/schemas/progress";

export async function GET() {
  const result = await requireClientUser();
  if ("error" in result) return result.error;

  const docs = await Message.find({ client: result.client._id })
    .sort({ createdAt: 1 })
    .lean();

  const messages: SerializedMessage[] = docs.map((d) => ({
    id: String(d._id),
    senderRole: d.senderRole,
    body: d.body,
    createdAt: d.createdAt,
  }));

  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const result = await requireClientUser();
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
    trainer: result.client.trainer,
    client: result.client._id,
    sender: result.userId,
    senderRole: "client",
    body: parsed.data.body,
  });

  await createNotification({
    user: result.client.trainer,
    type: "message",
    title: `New message from ${result.client.name}`,
    body: parsed.data.body.slice(0, 80),
    link: `/dashboard/clients/${result.client._id}`,
  });

  const message: SerializedMessage = {
    id: String(created._id),
    senderRole: "client",
    body: created.body,
    createdAt: created.createdAt,
  };

  return NextResponse.json({ message }, { status: 201 });
}
