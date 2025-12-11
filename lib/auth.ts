import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Get NEXTAUTH_SECRET with fallback for development only
const getSecret = () => {
  if (process.env.NEXTAUTH_SECRET) {
    // Remove quotes if present (common in .env files)
    let secret = process.env.NEXTAUTH_SECRET.trim();
    if ((secret.startsWith('"') && secret.endsWith('"')) || 
        (secret.startsWith("'") && secret.endsWith("'"))) {
      secret = secret.slice(1, -1);
    }
    return secret;
  }
  
  // Only allow fallback in development
  if (process.env.NODE_ENV === "development") {
    console.warn("⚠️  NEXTAUTH_SECRET not set. Using development fallback. Set NEXTAUTH_SECRET in production!");
    return "development-secret-change-in-production";
  }
  
  // In production, return undefined to let NextAuth throw the proper error
  return undefined;
};

export const authOptions: NextAuthOptions = {
  secret: getSecret(),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || user.role !== "admin") {
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

