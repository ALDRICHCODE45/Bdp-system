import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { env } from "@/core/shared/config/env.config";
import prisma from "@/core/lib/prisma";
import { PrismaUserRepository } from "@/features/sistema/usuarios/server/repositories/PrismaUserRepository.repository";
import { BcryptPasswordHasher } from "@/core/shared/security/hasher";
import {
  loginLimiter,
  normalizeEmail,
} from "@/core/shared/security/rate-limit";

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
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(1) })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        // Rate-limit gate: extract caller IP and a normalized email, then
        // consult the login limiter BEFORE bcrypt so a blocked caller
        // never reaches the password hasher (no user enumeration).
        //
        // NOTE: x-forwarded-for trust depends on Dockploy proxy being the
        // sole ingress — operator must verify deploy topology before
        // relying on per-IP throttling.
        const ip = (
          request.headers.get("x-forwarded-for")?.split(",")[0] ??
          request.headers.get("x-real-ip") ??
          "unknown"
        ).trim();
        const normalizedEmail = normalizeEmail(email);
        const limiterKey = `${ip}|${normalizedEmail}`;

        if (!loginLimiter.check(limiterKey)) {
          return null;
        }

        // Lazy initialization: crear instancias solo cuando se necesiten
        const userRepository = new PrismaUserRepository(prisma);
        const passwordHasher = new BcryptPasswordHasher();

        // Buscar usuario por email con contraseña y roles
        const user = await userRepository.findByEmailWithPassword({
          email: normalizedEmail,
        });

        if (!user) {
          return null;
        }

        // Verificar que el usuario esté activo
        if (!user.isActive) {
          return null;
        }

        // Verificar contraseña
        const isPasswordValid = await passwordHasher.verify(
          password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // Successful authentication — clear the bucket so the next failure
        // sequence starts fresh.
        loginLimiter.reset(limiterKey);

        // Obtener los roles del usuario
        const roles = user.roles.map((userRole) => userRole.role.name);
        const primaryRole = roles[0] || "user";

        // Obtener todos los permisos de todos los roles del usuario en una sola query
        const roleIds = user.roles.map((userRole) => userRole.role.id);
        const rolePermissions = await prisma.rolePermission.findMany({
          where: { roleId: { in: roleIds } },
          include: { permission: { select: { name: true } } },
        });
        const allPermissions = [
          ...new Set(rolePermissions.map((rp) => rp.permission.name)),
        ];

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: primaryRole,
          permissions: allPermissions,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        if (user.role) {
          token.role = user.role;
        }
        if (user.permissions) {
          token.permissions = user.permissions;
        }
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
    maxAge: 86400,
    updateAge: 3600,
  },
  secret: env.AUTH_SECRET,
});
