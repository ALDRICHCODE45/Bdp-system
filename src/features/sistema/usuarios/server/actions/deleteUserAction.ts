"use server";
import { revalidatePath } from "next/cache";
import prisma from "@/core/lib/prisma";
import { PrismaUserRepository } from "../repositories/PrismaUserRepository.repository";
import { auth } from "@/core/lib/auth/auth";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const deleteUserAction = async (userId: string) => {
  // Verificar permiso antes de continuar
  await requireAnyPermission(
    [
      PermissionActions.usuarios.eliminar,
      PermissionActions.usuarios.gestionar,
    ],
    "No tienes permiso para eliminar usuarios"
  );
  try {
    const authenticatedUser = await auth();
    const authenticatedUserId = authenticatedUser?.user.id;

    if (authenticatedUserId === userId) {
      return {
        ok: false,
        error: "No puedes eliminar a un usuario autenticado",
      };
    }

    const userRepository = new PrismaUserRepository(prisma);

    // Verificar que el usuario existe antes de eliminar
    const user = await userRepository.findById({ id: userId });

    if (!user) {
      return {
        ok: false,
        error: "Usuario no encontrado",
      };
    }

    // Eliminar el usuario (esto también eliminará las relaciones de roles)
    await userRepository.delete({ id: userId });

    revalidatePath("/usuarios");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Error al eliminar usuario",
    };
  }
};
