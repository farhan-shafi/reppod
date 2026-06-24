import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/sign-in",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const user = auth?.user as { role?: string } | undefined;
      const isLoggedIn = !!user;
      const role = user?.role ?? "trainer";
      const homeForRole = role === "client" ? "/app" : "/dashboard";

      const path = nextUrl.pathname;
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
