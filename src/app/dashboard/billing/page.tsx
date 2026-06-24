import { requireTrainer } from "@/lib/auth-helpers";
import { connectDB } from "@/lib/mongoose";
import { Client } from "@/models/Client";
import { getOrCreateSubscription } from "@/lib/billing/subscription";
import { billingMode } from "@/lib/billing/provider";
import BillingView from "./BillingView";

export const metadata = { title: "Billing · FlexFlow" };

export default async function BillingPage() {
  const user = await requireTrainer();
  const sub = await getOrCreateSubscription(user.id);

  await connectDB();
  const clientCount = await Client.countDocuments({ trainer: user.id });

  return (
    <BillingView
      tier={sub.tier}
      status={sub.status}
      cycle={sub.cycle}
      trialDaysLeft={sub.trialDaysLeft}
      clientCount={clientCount}
      maxClients={sub.limits.maxClients}
      mock={billingMode === "mock"}
    />
  );
}
