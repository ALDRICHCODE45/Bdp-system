"use server";

import prisma from "@/core/lib/prisma";
import { PrismaUserRepository } from "../repositories/PrismaUserRepository.repository";

export const getUserAction = async (userId: string) => {
  try {
    const userRepository = new PrismaUserRepository(prisma);
    const user = await userRepository.findById({ id: userId });

    if (!user) {
      return {
        ok: false,
        error: "Usuario no encontrado",
        data: null,
      };
    }

    // Retornar datos serializables (sin password)
    return {
      ok: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles.map((role) => role.role.name),
        isActive: user.isActive,
      },
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al obtener usuario",
      data: null,
    };
  }
};
