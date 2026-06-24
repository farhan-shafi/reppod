import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import DashboardMobileNav from "@/components/dashboard/DashboardMobileNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={session.user} />
        <main className="flex-1 p-6 md:p-10 pb-24 lg:pb-10">{children}</main>
      </div>
      <DashboardMobileNav />
    </div>
  );
}
