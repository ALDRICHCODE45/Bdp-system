import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { env } from "@/core/shared/config/env.config";
import prisma from "@/core/lib/prisma";
import { PrismaUserRepository } from "@/features/sistema/usuarios/server/repositories/PrismaUserRepository.repository";
import type { UserWithRoles } from "@/features/sistema/usuarios/server/mappers/userMapper";
import { makeOtpVerifier } from "@/features/Auth/server/services/makeOtpVerifier";

/** 7-day session lifetime, per the mandatory-OTP auth contract. */
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/**
 * How often the JWT flow re-reads the user's active flag, roles and
 * permissions. Keeps a long 7-day token from outliving a deactivation or a
 * permission change by more than this window.
 */
const ACTIVE_USER_REVALIDATION_MS = 15 * 60 * 1000;

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

/** Authorization snapshot embedded in the session/JWT. */
type AuthorizedUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
};

/**
 * Loads the user's current authorization state. Returns `null` when the user
 * no longer exists or was deactivated, so callers can invalidate the session.
 */
async function loadAuthorizedUser(
  userId: string,
): Promise<AuthorizedUser | null> {
  const userRepository = new PrismaUserRepository(prisma);
  const user = await userRepository.findById({ id: userId });

  if (!user || !user.isActive) {
    return null;
  }

  return toAuthorizedUser(user);
}

/** Projects a user row with roles onto the flat authorization snapshot. */
async function toAuthorizedUser(user: UserWithRoles): Promise<AuthorizedUser> {
  const roles = user.roles.map((userRole) => userRole.role.name);
  const primaryRole = roles[0] || "user";

  // Obtener todos los permisos de todos los roles del usuario en una sola query
  const roleIds = user.roles.map((userRole) => userRole.role.id);
  const rolePermissions = await prisma.rolePermission.findMany({
    where: { roleId: { in: roleIds } },
    include: { permission: { select: { name: true } } },
  });
  const permissions = [
    ...new Set(rolePermissions.map((rp) => rp.permission.name)),
  ];

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: primaryRole,
    permissions,
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "Código", type: "text" },
      },
      async authorize(credentials, request) {
        // Email OTP is mandatory for every login: a valid password alone never
        // reaches this callback. `requestOtpAction` proves the password and
        // emails a single-use code; this callback consumes that code and only
        // then lets NextAuth mint a session.
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            otp: z.string().regex(/^\d{6}$/),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, otp } = parsedCredentials.data;

        // Rate-limit gate: the OTP service throttles verification per caller
        // before comparing the code, so a blocked caller never reaches the OTP
        // hash check (no account/OTP enumeration).
        //
        // NOTE: x-forwarded-for trust depends on the Dockploy proxy being the
        // sole ingress — operator must verify deploy topology before relying
        // on per-IP throttling.
        const clientKey = (
          request.headers.get("x-forwarded-for")?.split(",")[0] ??
          request.headers.get("x-real-ip") ??
          "unknown"
        ).trim();

        const otpService = makeOtpVerifier({ prisma });
        const verification = await otpService.verifyOtp({
          email,
          code: otp,
          clientKey,
        });

        if (!verification.ok) {
          // Generic failure for throttled, invalid, expired and already
          // consumed codes alike: authorize never reveals which one applies.
          return null;
        }

        // Only after the code was consumed do we resolve the authorization
        // state. `verifyOtp` already re-checked that the account is active.
        return loadAuthorizedUser(verification.value.userId);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign-in: snapshot the authorization state returned by
      // `authorize` and stamp the revalidation clock.
      if (user) {
        if (user.role) {
          token.role = user.role;
        }
        if (user.permissions) {
          token.permissions = user.permissions;
        }
        token.validatedAt = Date.now();
        return token;
      }

      const validatedAt =
        typeof token.validatedAt === "number" ? token.validatedAt : 0;

      if (Date.now() - validatedAt < ACTIVE_USER_REVALIDATION_MS) {
        return token;
      }

      // Missing subject means the token has no resolvable user: invalidate it.
      if (!token.sub) {
        return null;
      }

      try {
        const authorizedUser = await loadAuthorizedUser(token.sub);

        // Returning `null` makes Auth.js clear the session cookie, so a
        // deactivated or deleted user is signed out instead of keeping a
        // stale 7-day token.
        if (!authorizedUser) {
          return null;
        }

        token.role = authorizedUser.role;
        token.permissions = authorizedUser.permissions;
        token.validatedAt = Date.now();
      } catch (error) {
        // Fail closed: once the freshness window has elapsed, a session whose
        // active flag, roles and permissions could not be re-checked must not
        // be trusted. Returning `null` clears the session cookie instead of
        // preserving stale authorization and sliding `validatedAt` forward.
        console.error(
          "[auth] No se pudo revalidar el usuario activo en el token JWT",
          error,
        );
        return null;
      }

      return token;
    },
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
});
