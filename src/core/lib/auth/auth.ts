import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { env } from "@/core/shared/config/env.config";
import prisma from "@/core/lib/prisma";
import { PrismaUserRepository } from "@/features/sistema/usuarios/server/repositories/PrismaUserRepository.repository";
import { BcryptPasswordHasher } from "@/core/shared/security/hasher";

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

        // Obtener los roles del usuario
        const roles = user.roles.map((userRole) => userRole.role.name);
        // console.log("Roles del usuario en authorize", { roles });
        const primaryRole = roles[0] || "user";

        // Obtener todos los permisos de todos los roles del usuario
        const roleIds = user.roles.map((userRole) => userRole.role.id);
        const allPermissions: string[] = [];

        // Obtener permisos de cada rol
        for (const roleId of roleIds) {
          const rolePermissions = await prisma.rolePermission.findMany({
            where: { roleId },
            include: { permission: true },
          });
          // console.log("Role permissions en authorize aun", { rolePermissions });

          rolePermissions.forEach((rp) => {
            if (!allPermissions.includes(rp.permission.name)) {
              allPermissions.push(rp.permission.name);
            }
          });
        }

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
        // TODO: [DEBUG] Log para verificar cambios de usuario - REMOVER EN PRODUCCIÓN
        // console.log("[JWT Callback] Nuevo login detectado:", {
        //   userId: user.id,
        //   email: user.email,
        //   role: user.role,
        //   permissionsCount: user.permissions?.length || 0,
        // });

        if (user.role) {
          token.role = user.role;
        }
        if (user.permissions) {
          token.permissions = user.permissions;
          // TODO: [DEBUG] REMOVER EN PRODUCCIÓN
          // console.log("Existen los roles del usuario en jwt", {
          //   permisos: user.permissions,
          // });
        }
        // TODO: [DEBUG] REMOVER EN PRODUCCIÓN
        // console.log("No existen los roles ni permisos en jwt");
      } else {
        // TODO: [DEBUG] Log para verificar reutilización de token - REMOVER EN PRODUCCIÓN
        // console.log("[JWT Callback] Token existente:", {
        //   userId: token.sub,
        //   role: token.role,
        //   permissionsCount:
        //     (token.permissions as string[] | undefined)?.length || 0,
        // });
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
          // TODO: [DEBUG] REMOVER EN PRODUCCIÓN
          // console.log("Existen los roles del usuario en session", {
          //   permisos: session.user.permissions,
          // });
        }
        // TODO: [DEBUG] REMOVER EN PRODUCCIÓN
        //console.log("No existen los roles ni permisos en session");

        // TODO: [DEBUG] Log para verificar sesión creada - REMOVER EN PRODUCCIÓN
        // console.log("[Session Callback] Sesión creada:", {
        //   userId: session.user.id,
        //   email: session.user.email,
        //   role: session.user.role,
        //   permissions: session.user.permissions?.slice(0, 3) || [], // Primeros 3 permisos
        //   totalPermissions: session.user.permissions?.length || 0,
        // });
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
