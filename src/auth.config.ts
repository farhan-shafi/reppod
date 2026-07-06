import type { NextAuthConfig } from "next-auth";
import { DEMO_COACH_EMAIL, DEMO_CLIENT_EMAIL } from "@/lib/demo";

export const authConfig = {
  pages: {
    signIn: "/sign-in",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const user = auth?.user as { role?: string; email?: string } | undefined;
      const isLoggedIn = !!user;
      const role = user?.role ?? "trainer";
      const homeForRole = role === "client" ? "/app" : "/dashboard";

      const path = nextUrl.pathname;

      // Read-only demo: block writes from the public demo accounts everywhere
      // except auth routes (so they can still sign in/out).
      const isDemo =
        user?.email === DEMO_COACH_EMAIL || user?.email === DEMO_CLIENT_EMAIL;
      const isWrite = !["GET", "HEAD", "OPTIONS"].includes(request.method);
      if (
        isDemo &&
        isWrite &&
        path.startsWith("/api/") &&
        !path.startsWith("/api/auth")
      ) {
        return Response.json(
          { error: "This is a read-only demo. Sign up to make changes." },
          { status: 403 }
        );
      }

      const isOnDashboard = path.startsWith("/dashboard");
      const isOnApp = path.startsWith("/app");
      const isOnAuthPage =
        path.startsWith("/sign-in") || path.startsWith("/sign-up");

      // Trainer-only area
      if (isOnDashboard) {
        if (!isLoggedIn) return false;
        if (role === "client") {
          return Response.redirect(new URL("/app", nextUrl));
        }
        return true;
      }

      // Client-only area
      if (isOnApp) {
        if (!isLoggedIn) return false;
        if (role !== "client") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      // Already signed in → skip auth pages, land on role home
      if (isOnAuthPage && isLoggedIn) {
        return Response.redirect(new URL(homeForRole, nextUrl));
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "trainer";
      }
      if (trigger === "update" && session) {
        const next = session as { name?: string; image?: string };
        if (typeof next.name === "string") token.name = next.name;
        if (typeof next.image === "string") token.picture = next.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
