import { ClipboardList, LineChart, MessageSquare } from "lucide-react";

export default function OverviewTab({
  clientName,
  clientNotes,
  assignmentCount,
  sessionCount,
  messageCount,
}: {
  clientName: string;
  clientNotes?: string;
  assignmentCount: number;
  sessionCount: number;
  messageCount: number;
}) {
  const stats = [
    { label: "Workouts assigned", value: assignmentCount, icon: ClipboardList },
    { label: "Sessions logged", value: sessionCount, icon: LineChart },
    { label: "Messages", value: messageCount, icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">{s.label}</span>
              <s.icon className="size-4 text-white/40" />
            </div>
            <div className="mt-3 text-3xl font-semibold text-white">
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {clientNotes ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h3 className="text-xs uppercase tracking-wider text-white/50">
            About {clientName}
          </h3>
          <p className="mt-2 text-sm text-white/80 whitespace-pre-wrap">
            {clientNotes}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-white/50">
          No background notes on {clientName} yet. Add them by editing this
          client.
        </div>
      )}
    </div>
  );
}
