import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Include /api so the read-only demo guard runs on write requests.
  matcher: ["/dashboard/:path*", "/app/:path*", "/api/:path*", "/sign-in", "/sign-up"],
};
