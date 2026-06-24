import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireOwnedClient } from "@/lib/api-helpers";
import { MealPlan } from "@/models/MealPlan";
import { MealPlanAssignment } from "@/models/MealPlanAssignment";
import { createNotification } from "@/models/Notification";
import {
  assignMealPlanSchema,
  type SerializedMealPlanAssignment,
} from "@/lib/schemas/nutrition";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const result = await requireOwnedClient(id);
  if ("error" in result) return result.error;

  const docs = await MealPlanAssignment.find({ client: id })
    .populate<{
      mealPlan: {
        _id: Types.ObjectId;
        name: string;
        targets: { calories: number; protein: number; carbs: number; fat: number };
        meals: unknown[];
      };
    }>({ path: "mealPlan", model: MealPlan, select: "name targets meals" })
    .sort({ assignedAt: -1 })
    .lean();

  const assignments: SerializedMealPlanAssignment[] = docs
    .filter((d) => d.mealPlan)
    .map((d) => ({
      id: String(d._id),
      client: String(d.client),
      mealPlan: {
        id: String(d.mealPlan._id),
        name: d.mealPlan.name,
        targets: d.mealPlan.targets,
        mealCount: Array.isArray(d.mealPlan.meals) ? d.mealPlan.meals.length : 0,
      },
      assignedAt: d.assignedAt,
      status: d.status,
    }));

  return NextResponse.json({ assignments });
}

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const result = await requireOwnedClient(id);
  if ("error" in result) return result.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = assignMealPlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  if (!Types.ObjectId.isValid(parsed.data.mealPlanId)) {
    return NextResponse.json({ error: "Invalid meal plan" }, { status: 400 });
  }

  const mealPlan = await MealPlan.findOne({
    _id: parsed.data.mealPlanId,
    trainer: result.trainerId,
  });
  if (!mealPlan) {
    return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
  }

  try {
    const created = await MealPlanAssignment.create({
      trainer: result.trainerId,
      client: id,
      mealPlan: mealPlan._id,
    });

    if (result.client.user) {
      await createNotification({
        user: result.client.user,
        type: "workout_assigned",
        title: "New meal plan assigned",
        body: `Your coach assigned "${mealPlan.name}".`,
        link: "/app/nutrition",
      });
    }

    const assignment: SerializedMealPlanAssignment = {
      id: String(created._id),
      client: String(created.client),
      mealPlan: {
        id: String(mealPlan._id),
        name: mealPlan.name,
        targets: mealPlan.targets,
        mealCount: mealPlan.meals.length,
      },
      assignedAt: created.assignedAt,
      status: created.status,
    };
    return NextResponse.json({ assignment }, { status: 201 });
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: "This meal plan is already assigned to this client." },
        { status: 409 }
      );
    }
    throw err;
  }
}
