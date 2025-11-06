"use server";

import prisma from "@/core/lib/prisma";
import { PrismaRoleRepository } from "../repositories/PrismaRoleRepository.repository";
import { toRoleDto } from "../mappers/roleMapper";

export const getRoleAction = async (roleId: string) => {
  try {
    const roleRepository = new PrismaRoleRepository(prisma);
    const role = await roleRepository.findByIdWithPermissions({ id: roleId });

    if (!role) {
      return {
        ok: false,
        error: "Rol no encontrado",
        data: null,
      };
    }

    return {
      ok: true,
      data: toRoleDto(role),
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al obtener rol",
      data: null,
    };
  }
};

