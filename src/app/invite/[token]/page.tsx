import { Suspense } from "react";
import AcceptInviteForm from "./AcceptInviteForm";

export const metadata = {
  title: "Accept invite · Reppod",
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <Suspense>
      <AcceptInviteForm token={token} />
    </Suspense>
  );
}
