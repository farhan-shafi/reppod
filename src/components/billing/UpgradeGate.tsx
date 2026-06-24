import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

export default function UpgradeGate({
  feature,
  description,
}: {
  feature: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-fuchsia-500/30 bg-gradient-to-br from-fuchsia-500/10 to-orange-500/5 p-10 text-center">
      <div className="mx-auto size-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-orange-500 flex items-center justify-center">
        <Lock className="size-5 text-white" />
      </div>
      <h2 className="mt-4 text-xl font-bold text-white">{feature} is a Pro feature</h2>
      <p className="mt-2 text-sm text-white/60 max-w-md mx-auto">{description}</p>
      <Link
        href="/dashboard/billing"
        className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition"
      >
        <Sparkles className="size-4" />
        Upgrade to Pro
      </Link>
    </div>
  );
}
