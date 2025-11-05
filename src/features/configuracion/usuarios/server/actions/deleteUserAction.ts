"use server";
import { revalidatePath } from "next/cache";
import prisma from "@/core/lib/prisma";
import { PrismaUserRepository } from "../repositories/PrismaUserRepository.repository";

export const deleteUserAction = async (userId: string) => {
  try {
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

