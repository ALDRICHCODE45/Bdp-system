import type { NextAuthConfig } from "next-auth";
import { env } from "@/core/shared/config/env.config";

/**
 * Edge-safe Auth.js configuration.
 *
 * This module is the only auth surface bundled into the Edge middleware
 * runtime, so it must stay free of Node-only dependencies. The Credentials
 * provider (OTP + Prisma + bcrypt) and the database-backed JWT revalidation
 * live in `auth.ts`, which imports and extends this configuration for the
 * Node.js runtime. Nothing here may import Prisma, `node:crypto`, or any
 * provider whose dependency graph reaches them.
 */

/** 7-day session lifetime, per the mandatory-OTP auth contract. */
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

// Extender los tipos de NextAuth para incluir el rol y permisos
declare module "next-auth" {
  interface User {
    role?: string;
    permissions?: string[];
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      permissions?: string[];
    };
  }
}

declare module "next-auth" {
  interface JWT {
    role?: string;
    permissions?: string[];
    /** Epoch ms of the last active-user/role/permission revalidation. */
    validatedAt?: number;
  }
}

/**
 * Shared, runtime-neutral Auth.js configuration.
 *
 * `providers` stays empty on purpose: the Credentials/OTP provider is added
 * only by the Node.js instance in `auth.ts`. The JWT callback is also left to
 * the Node.js instance; the Edge middleware only decodes the session cookie
 * and maps it through `session`, which keeps `req.auth.user.permissions`
 * available to the route guard.
 */
export default {
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || "";
        if (token.role) {
          session.user.role = token.role as string;
        }
        if (token.permissions) {
          session.user.permissions = token.permissions as string[];
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/error",
  },
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
    updateAge: 3600,
  },
  secret: env.AUTH_SECRET,
} satisfies NextAuthConfig;
