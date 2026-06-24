import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireOwnedClient } from "@/lib/api-helpers";
import { WorkoutAssignment } from "@/models/WorkoutAssignment";

type Params = { params: Promise<{ id: string; assignmentId: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const { id, assignmentId } = await params;
  const result = await requireOwnedClient(id);
  if ("error" in result) return result.error;

  if (!Types.ObjectId.isValid(assignmentId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const doc = await WorkoutAssignment.findOneAndDelete({
    _id: assignmentId,
    client: id,
  });
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
