import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { Client } from "@/models/Client";
import { profileUpdateSchema } from "@/lib/schemas/profile";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { name, bio, image, unitPreference, businessName } = parsed.data;
  if (name !== undefined) user.name = name;
  if (bio !== undefined) user.bio = bio || undefined;
  if (image !== undefined) user.image = image || undefined;
  if (unitPreference !== undefined) user.unitPreference = unitPreference;
  if (businessName !== undefined && user.role === "trainer") {
    user.businessName = businessName || undefined;
  }
  await user.save();

  // Keep the linked client record's display name in sync for clients.
  if (user.role === "client" && name) {
    await Client.updateOne({ user: user._id }, { $set: { name } });
  }

  return NextResponse.json({
    user: {
      name: user.name,
      bio: user.bio,
      image: user.image,
      unitPreference: user.unitPreference,
      businessName: user.businessName,
    },
  });
}
