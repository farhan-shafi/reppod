import Link from "next/link";
import { Dumbbell } from "lucide-react";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-gradient-to-br from-fuchsia-500 to-orange-500">
              <Dumbbell className="size-4 text-white" />
            </span>
            <span className="font-bold tracking-tight text-white">Reppod</span>
          </Link>
          <Link href="/" className="text-sm text-white/60 hover:text-white transition">
            ← Back home
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="prose-invert space-y-4 text-white/70 [&_h1]:text-white [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h1]:text-3xl [&_h1]:font-bold [&_a]:text-fuchsia-300">
          {children}
        </div>
      </main>
    </div>
  );
}
