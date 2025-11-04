import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { env } from "@/core/shared/config/env.config";
import prisma from "@/core/lib/prisma";
import { PrismaUserRepository } from "@/features/configuracion/usuarios/server/repositories/PrismaUserRepository.repository";
import { BcryptPasswordHasher } from "@/core/shared/security/hasher";

// Extender los tipos de NextAuth para incluir el rol
declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
  }
}

declare module "next-auth" {
  interface JWT {
    role?: string;
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
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(1) })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        // Lazy initialization: crear instancias solo cuando se necesiten
        const userRepository = new PrismaUserRepository(prisma);
        const passwordHasher = new BcryptPasswordHasher();

        // Buscar usuario por email con contraseña y roles
        const user = await userRepository.findByEmailWithPassword({ email });

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

        // Obtener los roles del usuario (tomamos el primer rol o todos como string)
        const roles = user.roles.map((userRole) => userRole.role.name);
        const primaryRole = roles[0] || "user";

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: primaryRole,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.role) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || "";
        if (token.role) {
          session.user.role = token.role as string;
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
  },
  secret: env.AUTH_SECRET, // TODO: Agregar NEXTAUTH_SECRET a .env.local
});
