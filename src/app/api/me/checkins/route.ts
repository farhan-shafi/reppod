import { NextResponse } from "next/server";
import { requireClientUser } from "@/lib/api-helpers";
import { Checkin } from "@/models/Checkin";
import { createNotification } from "@/models/Notification";
import {
  checkinCreateSchema,
  type SerializedCheckin,
} from "@/lib/schemas/checkin";

function serialize(d: {
  _id: unknown;
  client: unknown;
  date: Date;
  weightKg?: number;
  measurements?: SerializedCheckin["measurements"];
  energy?: number;
  sleep?: number;
  mood?: number;
  adherence?: number;
  note?: string;
  photos: { url: string; pose: SerializedCheckin["photos"][number]["pose"] }[];
}): SerializedCheckin {
  return {
    id: String(d._id),
    client: String(d.client),
    date: d.date,
    weightKg: d.weightKg,
    measurements: d.measurements,
    energy: d.energy,
    sleep: d.sleep,
    mood: d.mood,
    adherence: d.adherence,
    note: d.note,
    photos: d.photos,
  };
}

export async function GET() {
  const result = await requireClientUser();
  if ("error" in result) return result.error;

  const docs = await Checkin.find({ client: result.client._id })
    .sort({ date: -1 })
    .limit(60)
    .lean();

  return NextResponse.json({ checkins: docs.map(serialize) });
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

  const parsed = checkinCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const created = await Checkin.create({
    trainer: result.client.trainer,
    client: result.client._id,
    date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
    weightKg: parsed.data.weightKg,
    measurements: parsed.data.measurements,
    energy: parsed.data.energy,
    sleep: parsed.data.sleep,
    mood: parsed.data.mood,
    adherence: parsed.data.adherence,
    note: parsed.data.note || undefined,
    photos: parsed.data.photos ?? [],
  });

  await createNotification({
    user: result.client.trainer,
    type: "session_logged",
    title: `${result.client.name} submitted a check-in`,
    body: parsed.data.weightKg ? `Weight: ${parsed.data.weightKg} kg.` : undefined,
    link: `/dashboard/clients/${result.client._id}`,
  });

  return NextResponse.json(
    { checkin: serialize(created.toObject()) },
    { status: 201 }
  );
}
