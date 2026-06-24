/**
 * Seeds (and resets) the public demo account.
 * Run with:  npm run seed:demo
 *
 * Creates a demo coach + a linked demo client with realistic clients,
 * workouts, a meal plan, logged sessions, weekly check-ins, and messages, so
 * the "Try the demo" experience looks like a live, in-use account.
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { User } from "../src/models/User";
import { Subscription } from "../src/models/Subscription";
import { Client } from "../src/models/Client";
import { Workout } from "../src/models/Workout";
import { WorkoutAssignment } from "../src/models/WorkoutAssignment";
import { WorkoutSession } from "../src/models/WorkoutSession";
import { MealPlan } from "../src/models/MealPlan";
import { MealPlanAssignment } from "../src/models/MealPlanAssignment";
import { Checkin } from "../src/models/Checkin";
import { Message } from "../src/models/Message";
import { Notification } from "../src/models/Notification";
import { FOODS, macrosForQty } from "../src/lib/foods";
import {
  DEMO_COACH_EMAIL,
  DEMO_CLIENT_EMAIL,
  DEMO_PASSWORD,
} from "../src/lib/demo";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Run with: npm run seed:demo");
  process.exit(1);
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);

function food(id: string, grams: number) {
  const f = FOODS.find((x) => x.id === id)!;
  return { foodId: f.id, name: f.name, qtyGrams: grams, ...macrosForQty(f.per100, grams) };
}

async function main() {
  await mongoose.connect(uri!);
  console.log("Connected. Resetting demo data…");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  // --- Wipe any previous demo data (coach + linked client + all their records) ---
  const prevCoach = await User.findOne({ email: DEMO_COACH_EMAIL });
  if (prevCoach) {
    await Promise.all([
      Client.deleteMany({ trainer: prevCoach._id }),
      Workout.deleteMany({ trainer: prevCoach._id }),
      WorkoutAssignment.deleteMany({ trainer: prevCoach._id }),
      WorkoutSession.deleteMany({ trainer: prevCoach._id }),
      MealPlan.deleteMany({ trainer: prevCoach._id }),
      MealPlanAssignment.deleteMany({ trainer: prevCoach._id }),
      Checkin.deleteMany({ trainer: prevCoach._id }),
      Message.deleteMany({ trainer: prevCoach._id }),
      Notification.deleteMany({ user: prevCoach._id }),
      Subscription.deleteMany({ user: prevCoach._id }),
    ]);
  }
  await User.deleteMany({ email: { $in: [DEMO_COACH_EMAIL, DEMO_CLIENT_EMAIL] } });

  // --- Coach ---
  const coach = await User.create({
    name: "Jordan Rivera",
    email: DEMO_COACH_EMAIL,
    passwordHash,
    role: "trainer",
    businessName: "Rivera Strength Coaching",
    bio: "Online strength & physique coach. 8 years helping busy people get strong.",
    unitPreference: "kg",
  });
  await Subscription.create({
    user: coach._id,
    tier: "pro",
    status: "active",
    cycle: "monthly",
    provider: "mock",
    currentPeriodEnd: daysAgo(-25),
  });

  // --- Demo client login (linked to "Sarah Chen") ---
  const clientUser = await User.create({
    name: "Sarah Chen",
    email: DEMO_CLIENT_EMAIL,
    passwordHash,
    role: "client",
    unitPreference: "kg",
  });

  // --- Clients ---
  const sarah = await Client.create({
    trainer: coach._id,
    user: clientUser._id,
    name: "Sarah Chen",
    email: DEMO_CLIENT_EMAIL,
    goal: "weight_loss",
    status: "active",
    startDate: daysAgo(60),
    notes: "Desk job, trains 4x/week. Goal: lose 6kg, keep strength.",
    inviteStatus: "accepted",
  });
  await Client.create([
    {
      trainer: coach._id,
      name: "Marcus Lee",
      email: "marcus@example.com",
      goal: "muscle_gain",
      status: "active",
      startDate: daysAgo(40),
      inviteStatus: "accepted",
      notes: "Lean bulk, focus on back & shoulders.",
    },
    {
      trainer: coach._id,
      name: "Priya Patel",
      goal: "endurance",
      status: "active",
      startDate: daysAgo(20),
      inviteToken: "demo-priya-invite",
      inviteStatus: "pending",
    },
    {
      trainer: coach._id,
      name: "Tom Becker",
      goal: "general_fitness",
      status: "paused",
      startDate: daysAgo(90),
      inviteStatus: "accepted",
    },
  ]);

  // --- Workouts ---
  const push = await Workout.create({
    trainer: coach._id,
    name: "Push Day A",
    description: "Chest, shoulders, triceps.",
    blocks: [
      { exerciseId: "bench-press", sets: 4, reps: "6-8", restSec: 120, videoUrl: "https://res.cloudinary.com/demo/video/upload/dog.mp4", videoDuration: 15 },
      { exerciseId: "db-shoulder-press", sets: 3, reps: "8-10", restSec: 90 },
      { exerciseId: "incline-db-press", sets: 3, reps: "10-12", restSec: 90 },
      { exerciseId: "lateral-raise", sets: 3, reps: "12-15", restSec: 60 },
      { exerciseId: "tricep-pushdown", sets: 3, reps: "12-15", restSec: 60 },
    ],
  });
  const pull = await Workout.create({
    trainer: coach._id,
    name: "Pull Day A",
    description: "Back & biceps.",
    blocks: [
      { exerciseId: "deadlift", sets: 3, reps: "5", restSec: 150 },
      { exerciseId: "pull-up", sets: 3, reps: "6-10", restSec: 90 },
      { exerciseId: "barbell-row", sets: 3, reps: "8-10", restSec: 90 },
      { exerciseId: "lat-pulldown", sets: 3, reps: "10-12", restSec: 75 },
      { exerciseId: "barbell-curl", sets: 3, reps: "10-12", restSec: 60 },
    ],
  });
  const legs = await Workout.create({
    trainer: coach._id,
    name: "Leg Day",
    description: "Quads, hamstrings, calves.",
    blocks: [
      { exerciseId: "back-squat", sets: 4, reps: "6-8", restSec: 150 },
      { exerciseId: "romanian-deadlift", sets: 3, reps: "8-10", restSec: 120 },
      { exerciseId: "leg-press", sets: 3, reps: "12", restSec: 90 },
      { exerciseId: "leg-curl", sets: 3, reps: "12-15", restSec: 60 },
      { exerciseId: "calf-raise", sets: 4, reps: "15-20", restSec: 45 },
    ],
  });

  // --- Meal plan ---
  const mealPlan = await MealPlan.create({
    trainer: coach._id,
    name: "Lean 2200",
    description: "Higher protein, moderate carbs for fat loss.",
    targets: { calories: 2200, protein: 165, carbs: 200, fat: 70 },
    meals: [
      { title: "Breakfast", items: [food("oats", 80), food("whey", 30), food("banana", 120)] },
      { title: "Lunch", items: [food("chicken-breast", 200), food("white-rice", 180), food("broccoli", 150)] },
      { title: "Snack", items: [food("greek-yogurt", 200), food("almonds", 25)] },
      { title: "Dinner", items: [food("salmon", 180), food("sweet-potato", 200), food("mixed-veg", 150)] },
    ],
  });

  // --- Assign workouts + meal plan to Sarah ---
  await WorkoutAssignment.create([
    { trainer: coach._id, client: sarah._id, workout: push._id, assignedAt: daysAgo(55) },
    { trainer: coach._id, client: sarah._id, workout: pull._id, assignedAt: daysAgo(55) },
    { trainer: coach._id, client: sarah._id, workout: legs._id, assignedAt: daysAgo(55) },
  ]);
  await MealPlanAssignment.create({
    trainer: coach._id,
    client: sarah._id,
    mealPlan: mealPlan._id,
    assignedAt: daysAgo(50),
  });

  // --- Logged sessions (progressive overload → nice volume curve) ---
  const sessionDays = [42, 35, 28, 21, 14, 7, 2];
  const benchProg = [50, 52.5, 55, 55, 57.5, 60, 62.5];
  for (let i = 0; i < sessionDays.length; i++) {
    await WorkoutSession.create({
      trainer: coach._id,
      client: sarah._id,
      workout: push._id,
      performedAt: daysAgo(sessionDays[i]),
      blocks: [
        { exerciseId: "bench-press", sets: Array.from({ length: 4 }, () => ({ reps: 7, weight: benchProg[i] })) },
        { exerciseId: "db-shoulder-press", sets: Array.from({ length: 3 }, () => ({ reps: 9, weight: 16 + i })) },
        { exerciseId: "lateral-raise", sets: Array.from({ length: 3 }, () => ({ reps: 13, weight: 8 })) },
      ],
      notes: i === sessionDays.length - 1 ? "Felt strong, bench moving well!" : undefined,
    });
  }

  // --- Weekly check-ins (weight trending down + photos) ---
  const checkinWeeks = [
    { d: 49, w: 72.4, e: 3, s: 3, m: 4, a: 4 },
    { d: 35, w: 71.6, e: 4, s: 4, m: 4, a: 5 },
    { d: 21, w: 70.9, e: 4, s: 3, m: 5, a: 4 },
    { d: 7, w: 70.1, e: 5, s: 4, m: 5, a: 5 },
  ];
  for (let i = 0; i < checkinWeeks.length; i++) {
    const c = checkinWeeks[i];
    await Checkin.create({
      trainer: coach._id,
      client: sarah._id,
      date: daysAgo(c.d),
      weightKg: c.w,
      energy: c.e,
      sleep: c.s,
      mood: c.m,
      adherence: c.a,
      note: i === 0 ? "First check-in!" : i === checkinWeeks.length - 1 ? "Clothes fitting better 🎉" : undefined,
      photos:
        i === 0
          ? [{ url: "https://picsum.photos/seed/flexflow-before/420/560", pose: "front" }]
          : i === checkinWeeks.length - 1
          ? [{ url: "https://picsum.photos/seed/flexflow-after/420/560", pose: "front" }]
          : [],
    });
  }

  // --- Messages ---
  await Message.create([
    { trainer: coach._id, client: sarah._id, sender: coach._id, senderRole: "trainer", body: "Welcome aboard Sarah! Your first week is all set 💪", createdAt: daysAgo(54) },
    { trainer: coach._id, client: sarah._id, sender: clientUser._id, senderRole: "client", body: "Thank you! Excited to start.", createdAt: daysAgo(54) },
    { trainer: coach._id, client: sarah._id, sender: clientUser._id, senderRole: "client", body: "Bench felt great today, hit all my reps!", createdAt: daysAgo(2) },
    { trainer: coach._id, client: sarah._id, sender: coach._id, senderRole: "trainer", body: "Amazing progress — let's bump the weight next week.", createdAt: daysAgo(1) },
  ]);

  // --- A couple of coach notifications ---
  await Notification.create([
    { user: coach._id, type: "session_logged", title: "Sarah Chen logged a workout", body: "Completed Push Day A.", link: `/dashboard/clients/${sarah._id}`, read: false },
    { user: coach._id, type: "message", title: "New message from Sarah Chen", body: "Bench felt great today…", link: `/dashboard/clients/${sarah._id}`, read: false },
  ]);

  console.log("✅ Demo seeded.");
  console.log(`   Coach:  ${DEMO_COACH_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`   Client: ${DEMO_CLIENT_EMAIL} / ${DEMO_PASSWORD}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
