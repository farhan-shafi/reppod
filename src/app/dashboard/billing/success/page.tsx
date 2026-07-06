import { Suspense } from "react";
import BillingSuccess from "./BillingSuccess";

export const metadata = { title: "Subscription · Reppod" };

export default function BillingSuccessPage() {
  return (
    <Suspense>
      <BillingSuccess />
    </Suspense>
  );
}
