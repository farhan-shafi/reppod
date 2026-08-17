import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { authConfig } from "@/auth.config";
import { connectDB } from "@/lib/mongoose";
import { checkRateLimit } from "@/lib/rate-limit";
import { emailSchema, getClientAddress, rateLimitKey } from "@/lib/security";
import { User } from "@/models/User";

const credentialsSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(72),
});

const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(raw, request) {
      const parsed = credentialsSchema.safeParse(raw);
      if (!parsed.success) return null;

      const { email, password } = parsed.data;
      const address = getClientAddress(request);
      const rateLimit = await checkRateLimit(
        rateLimitKey("sign-in", `${address}:${email}`),
        10,
        15 * 60 * 1000
      );
      if (!rateLimit.allowed) return null;

      await connectDB();

      const user = await User.findOne({ email })
        .select("+passwordHash")
        .lean<{
          _id: { toString(): string };
          name: string;
          email: string;
          image?: string;
          passwordHash?: string;
          role: string;
        }>();

      if (!user?.passwordHash) return null;

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return null;

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      if (!user.email) return false;

      await connectDB();
      const email = user.email.trim().toLowerCase();
      let databaseUser = await User.findOne({ email });
      if (!databaseUser) {
        databaseUser = await User.create({
          email,
          name: user.name ?? email.split("@")[0],
          image: user.image ?? undefined,
          role: "trainer",
        });
      }

      user.id = databaseUser._id.toString();
      user.role = databaseUser.role;
      user.email = databaseUser.email;
      return true;
    },
  },
});
