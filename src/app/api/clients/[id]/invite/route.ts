import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { requireOwnedClient } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

/**
 * Returns (creating if needed) an invite token for this client.
 * Backfills clients created before invite tokens existed.
 */
export async function POST(_req: Request, { params }: Params) {
  const { id } = await params;
  const result = await requireOwnedClient(id);
  if ("error" in result) return result.error;

  const { client } = result;

  if (client.inviteStatus === "accepted") {
    return NextResponse.json(
      { error: "This client has already joined." },
      { status: 409 }
    );
  }

  if (!client.inviteToken) {
    client.inviteToken = randomBytes(24).toString("hex");
    await client.save();
  }

  return NextResponse.json({ token: client.inviteToken });
}
