import { requireTrainer } from "@/lib/auth-helpers";
import { getOrCreateSubscription } from "@/lib/billing/subscription";
import BillingView from "./BillingView";

export const metadata = { title: "Plan · Reppod" };

export default async function BillingPage() {
  const user = await requireTrainer();
  const sub = await getOrCreateSubscription(user.id);

  return <BillingView tier={sub.tier} cycle={sub.cycle} />;
}
