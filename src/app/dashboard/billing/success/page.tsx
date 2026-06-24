import { Suspense } from "react";
import BillingSuccess from "./BillingSuccess";

export const metadata = { title: "Subscription · FlexFlow" };

export default function BillingSuccessPage() {
  return (
    <Suspense>
      <BillingSuccess />
    </Suspense>
  );
}
