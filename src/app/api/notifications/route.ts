import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { Notification } from "@/models/Notification";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const [docs, unread] = await Promise.all([
    Notification.find({ user: session.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
    Notification.countDocuments({ user: session.user.id, read: false }),
  ]);

  return NextResponse.json({
    unread,
    notifications: docs.map((n) => ({
      id: String(n._id),
      type: n.type,
      title: n.title,
      body: n.body,
      link: n.link,
      read: n.read,
      createdAt: n.createdAt,
    })),
  });
}

// Mark all as read.
export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  await Notification.updateMany(
    { user: session.user.id, read: false },
    { $set: { read: true } }
  );

  return NextResponse.json({ ok: true });
}
