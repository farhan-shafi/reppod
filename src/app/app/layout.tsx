import { requireClient } from "@/lib/auth-helpers";
import ClientNav from "@/components/client-portal/ClientNav";
import ClientMobileNav from "@/components/client-portal/ClientMobileNav";
import NotificationBell from "@/components/notifications/NotificationBell";

export default async function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireClient();

  return (
    <div className="min-h-screen flex">
      <ClientNav user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 border-b border-white/10 bg-black/60 backdrop-blur-xl flex items-center justify-between px-6">
          <span className="lg:hidden font-bold text-white">Reppod</span>
          <div className="flex-1" />
          <NotificationBell />
        </header>
        <main className="flex-1 p-6 md:p-10 pb-24 lg:pb-10">{children}</main>
      </div>
      <ClientMobileNav />
    </div>
  );
}
