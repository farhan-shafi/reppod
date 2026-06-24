import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongoose";
import { Client } from "@/models/Client";

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  return session.user;
}

/** Trainer-only pages. Clients get bounced to their portal. */
export async function requireTrainer() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  if (session.user.role === "client") {
    redirect("/app");
  }
  return session.user;
}

/**
 * Client-only pages. Resolves the Client record linked to the signed-in user.
 * Trainers get bounced to their dashboard.
 */
export async function requireClient() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in");
  }
  if (session.user.role !== "client") {
    redirect("/dashboard");
  }

  await connectDB();
  const client = await Client.findOne({ user: session.user.id });
  if (!client) {
    // Authenticated as a client but no linked record — treat as not found.
    redirect("/sign-in");
  }

  return { user: session.user, client };
}
