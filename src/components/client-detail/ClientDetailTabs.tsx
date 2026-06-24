"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, LineChart, MessageSquare, User, Video } from "lucide-react";

import type {
  SerializedAssignment,
  SerializedSession,
  SerializedMessage,
} from "@/lib/schemas/progress";

import OverviewTab from "./OverviewTab";
import AssignmentsTab from "./AssignmentsTab";
import ProgressTab from "./ProgressTab";
import MessagesTab from "./MessagesTab";
import EngagementTab, { type EngagementItem } from "./EngagementTab";

type WorkoutOption = { id: string; name: string; blockCount: number };

const tabs = [
  { id: "overview", label: "Overview", icon: User },
  { id: "workouts", label: "Workouts", icon: ClipboardList },
  { id: "progress", label: "Progress", icon: LineChart },
  { id: "engagement", label: "Engagement", icon: Video },
  { id: "messages", label: "Messages", icon: MessageSquare },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function ClientDetailTabs({
  clientId,
  clientName,
  clientNotes,
  hasAccount,
  workoutOptions,
  initialAssignments,
  initialSessions,
  initialMessages,
  engagement,
}: {
  clientId: string;
  clientName: string;
  clientNotes?: string;
  hasAccount: boolean;
  workoutOptions: WorkoutOption[];
  initialAssignments: SerializedAssignment[];
  initialSessions: SerializedSession[];
  initialMessages: SerializedMessage[];
  engagement: EngagementItem[];
}) {
  const [active, setActive] = useState<TabId>("overview");

  return (
    <div className="space-y-6">
      <nav className="flex gap-1 p-1 rounded-full border border-white/10 bg-white/[0.03] w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className="relative px-4 py-1.5 rounded-full text-sm font-medium transition"
          >
            {active === t.id && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-full bg-white"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span
              className={`relative inline-flex items-center gap-1.5 ${
                active === t.id ? "text-black" : "text-white/70"
              }`}
            >
              <t.icon className="size-3.5" />
              {t.label}
            </span>
          </button>
        ))}
      </nav>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {active === "overview" && (
            <OverviewTab
              clientName={clientName}
              clientNotes={clientNotes}
              assignmentCount={initialAssignments.length}
              sessionCount={initialSessions.length}
              messageCount={initialMessages.length}
            />
          )}
          {active === "workouts" && (
            <AssignmentsTab
              clientId={clientId}
              workoutOptions={workoutOptions}
              initialAssignments={initialAssignments}
            />
          )}
          {active === "progress" && (
            <ProgressTab
              clientId={clientId}
              assignments={initialAssignments}
              initialSessions={initialSessions}
            />
          )}
          {active === "engagement" && (
            <EngagementTab
              clientName={clientName}
              videos={engagement}
              sessionCount={initialSessions.length}
            />
          )}
          {active === "messages" && (
            <MessagesTab
              clientId={clientId}
              clientName={clientName}
              hasAccount={hasAccount}
              initialMessages={initialMessages}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
