import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireClientUser } from "@/lib/api-helpers";
import { FoodLog } from "@/models/FoodLog";
import { createNotification } from "@/models/Notification";
import {
  foodLogCreateSchema,
  computeMacros,
  type SerializedFoodLog,
} from "@/lib/schemas/nutrition";

export async function GET() {
  const result = await requireClientUser();
  if ("error" in result) return result.error;

  const docs = await FoodLog.find({ client: result.client._id })
    .sort({ date: -1 })
    .limit(60)
    .lean();

  const logs: SerializedFoodLog[] = docs.map((d) => ({
    id: String(d._id),
    client: String(d.client),
    date: d.date,
    entries: d.entries,
    totals: computeMacros(d.entries),
  }));

  return NextResponse.json({ logs });
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

  const parsed = foodLogCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const mealPlanRef =
    parsed.data.mealPlanId && Types.ObjectId.isValid(parsed.data.mealPlanId)
      ? new Types.ObjectId(parsed.data.mealPlanId)
      : undefined;

  const created = await FoodLog.create({
    trainer: result.client.trainer,
    client: result.client._id,
    mealPlan: mealPlanRef,
    date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
    entries: parsed.data.entries,
  });

  await createNotification({
    user: result.client.trainer,
    type: "session_logged",
    title: `${result.client.name} logged a meal`,
    body: `${parsed.data.entries.length} item(s) logged.`,
    link: `/dashboard/clients/${result.client._id}`,
  });

  const log: SerializedFoodLog = {
    id: String(created._id),
    client: String(created.client),
    date: created.date,
    entries: created.entries,
    totals: computeMacros(created.entries),
  };

  return NextResponse.json({ log }, { status: 201 });
}
