import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireClientUser } from "@/lib/api-helpers";
import { Checkin } from "@/models/Checkin";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const result = await requireClientUser();
  if ("error" in result) return result.error;
  const { id } = await params;

  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const doc = await Checkin.findOneAndDelete({
    _id: id,
    client: result.client._id,
  });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
