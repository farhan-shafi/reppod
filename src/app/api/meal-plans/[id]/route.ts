import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { MealPlan } from "@/models/MealPlan";
import { MealPlanAssignment } from "@/models/MealPlanAssignment";
import { mealPlanUpdateSchema } from "@/lib/schemas/nutrition";

type Params = { params: Promise<{ id: string }> };

async function requireOwnedMealPlan(id: string, trainerId: string) {
  if (!Types.ObjectId.isValid(id)) return null;
  await connectDB();
  return MealPlan.findOne({ _id: id, trainer: trainerId });
}

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const doc = await requireOwnedMealPlan(id, session.user.id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { _id, trainer, ...rest } = doc.toObject();
  return NextResponse.json({
    mealPlan: { id: String(_id), trainer: String(trainer), ...rest },
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = mealPlanUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const doc = await requireOwnedMealPlan(id, session.user.id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  Object.assign(doc, parsed.data);
  await doc.save();

  const { _id, trainer, ...rest } = doc.toObject();
  return NextResponse.json({
    mealPlan: { id: String(_id), trainer: String(trainer), ...rest },
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const doc = await requireOwnedMealPlan(id, session.user.id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Cascade: remove assignments pointing at this plan (logs are kept as history).
  await MealPlanAssignment.deleteMany({ mealPlan: doc._id });
  await doc.deleteOne();

  return NextResponse.json({ ok: true });
}
