import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireOwnedClient } from "@/lib/api-helpers";
import { WorkoutSession } from "@/models/WorkoutSession";

type Params = { params: Promise<{ id: string; sessionId: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const { id, sessionId } = await params;
  const result = await requireOwnedClient(id);
  if ("error" in result) return result.error;

  if (!Types.ObjectId.isValid(sessionId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const doc = await WorkoutSession.findOneAndDelete({
    _id: sessionId,
    client: id,
  });
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
