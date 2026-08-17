import Link from "next/link";
import { ClipboardList, MessageSquare, TrendingUp, Users } from "lucide-react";

import { requireTrainer } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/mongoose";
import { Client } from "@/models/Client";
import { Workout } from "@/models/Workout";
import { WorkoutSession } from "@/models/WorkoutSession";
import { Message } from "@/models/Message";
import { User } from "@/models/User";
import OnboardingChecklist from "@/components/dashboard/OnboardingChecklist";

function getSevenDaysAgo() {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}

export default async function DashboardHome() {
  const user = await requireTrainer();
  await connectDB();

  const sevenDaysAgo = getSevenDaysAgo();

  const [activeCount, totalCount, workoutCount, sessionsThisWeek, messageCount, me] =
    await Promise.all([
      Client.countDocuments({ trainer: user.id, status: "active" }),
      Client.countDocuments({ trainer: user.id }),
      Workout.countDocuments({ trainer: user.id }),
      WorkoutSession.countDocuments({
        trainer: user.id,
        performedAt: { $gte: sevenDaysAgo },
      }),
      Message.countDocuments({ trainer: user.id, senderRole: "client" }),
      User.findById(user.id).select("businessName").lean<{ businessName?: string } | null>(),
    ]);

  const firstName = user.name?.split(" ")[0] ?? "Coach";

  const stats = [
    {
      label: "Active clients",
      value: activeCount,
      icon: Users,
      accent: "from-fuchsia-500/20 to-fuchsia-500/0",
    },
    {
      label: "Workouts built",
      value: workoutCount,
      icon: ClipboardList,
      accent: "from-orange-500/20 to-orange-500/0",
    },
    {
      label: "Sessions this week",
      value: sessionsThisWeek,
      icon: TrendingUp,
      accent: "from-emerald-500/20 to-emerald-500/0",
    },
    {
      label: "Client messages",
      value: messageCount,
      icon: MessageSquare,
      accent: "from-sky-500/20 to-sky-500/0",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Welcome back, {firstName} 👋
        </h1>
        <p className="mt-1 text-white/60">
          Here&apos;s what&apos;s happening across your coaching business today.
        </p>
      </div>

      <OnboardingChecklist
        businessName={me?.businessName}
        hasClients={totalCount > 0}
        hasWorkouts={workoutCount > 0}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${s.accent} pointer-events-none`}
            />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">{s.label}</span>
                <s.icon className="size-4 text-white/40" />
              </div>
              <div className="mt-3 text-3xl font-semibold text-white">
                {s.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalCount === 0 ? (
        <Link
          href="/dashboard/clients"
          className="block rounded-2xl border border-dashed border-white/15 p-12 text-center hover:border-white/30 transition"
        >
          <div className="mx-auto size-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-orange-500 flex items-center justify-center">
            <Users className="size-5 text-white" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-white">
            Add your first client
          </h2>
          <p className="mt-1 text-sm text-white/60 max-w-sm mx-auto">
            Clients see workouts, log progress, and message you — all from their
            own dashboard.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium">
            + New client
          </span>
        </Link>
      ) : (
        <Link
          href="/dashboard/clients"
          className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.05] transition"
        >
          <h3 className="text-white font-medium">Manage your clients →</h3>
          <p className="text-sm text-white/60 mt-1">
            {totalCount} total · {activeCount} active
          </p>
        </Link>
      )}
    </div>
  );
}
