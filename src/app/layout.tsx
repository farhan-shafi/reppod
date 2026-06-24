import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import AuthSessionProvider from "@/components/AuthSessionProvider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlexFlow — The coaching platform built for trainers",
  description:
    "Deliver workouts, track progress, and grow your client base — without juggling 5 apps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-black text-white selection:bg-fuchsia-500/40">
        <AuthSessionProvider>
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
