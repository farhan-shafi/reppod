import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { Client } from "@/models/Client";
import type { IClient } from "@/models/Client";
import type { HydratedDocument } from "mongoose";

/** Trainer owns this client record. */
export async function requireOwnedClient(clientId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "client") {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (!Types.ObjectId.isValid(clientId)) {
    return {
      error: NextResponse.json({ error: "Not found" }, { status: 404 }),
    };
  }
  await connectDB();
  const client = await Client.findOne({
    _id: clientId,
    trainer: session.user.id,
  });
  if (!client) {
    return {
      error: NextResponse.json({ error: "Not found" }, { status: 404 }),
    };
  }
  return { client, trainerId: session.user.id };
}

/** The signed-in user is a client; resolve their linked Client record. */
export async function requireClientUser(): Promise<
  | { error: NextResponse }
  | {
      client: HydratedDocument<IClient>;
      userId: string;
    }
> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "client") {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  await connectDB();
  const client = await Client.findOne({ user: session.user.id });
  if (!client) {
    return {
      error: NextResponse.json({ error: "Not found" }, { status: 404 }),
    };
  }
  return { client, userId: session.user.id };
}
