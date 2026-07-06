import Link from "next/link";
import { Dumbbell } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
      <div
        aria-hidden
        className="absolute -top-32 -left-32 w-[35rem] h-[35rem] rounded-full bg-fuchsia-600/30 blur-[120px]"
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -right-32 w-[35rem] h-[35rem] rounded-full bg-orange-500/25 blur-[120px]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />

      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-white/90 hover:text-white transition"
      >
        <span className="p-1.5 rounded-lg bg-gradient-to-br from-fuchsia-500 to-orange-500">
          <Dumbbell className="size-4 text-white" />
        </span>
        <span className="font-bold tracking-tight">Reppod</span>
      </Link>

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
