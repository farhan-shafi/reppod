import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { MealPlan } from "@/models/MealPlan";
import { mealPlanCreateSchema } from "@/lib/schemas/nutrition";
import { getLimits } from "@/lib/billing/subscription";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const docs = await MealPlan.find({ trainer: session.user.id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({
    mealPlans: docs.map(({ _id, trainer, ...rest }) => ({
      id: String(_id),
      trainer: String(trainer),
      ...rest,
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role === "client") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = mealPlanCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const limits = await getLimits(session.user.id);
  if (!limits.nutrition) {
    return NextResponse.json(
      { error: "Nutrition is a Pro feature. Upgrade to build meal plans.", code: "PLAN_LIMIT" },
      { status: 402 }
    );
  }

  await connectDB();
  const created = await MealPlan.create({
    ...parsed.data,
    trainer: session.user.id,
  });

  const { _id, trainer, ...rest } = created.toObject();
  return NextResponse.json(
    { mealPlan: { id: String(_id), trainer: String(trainer), ...rest } },
    { status: 201 }
  );
}
