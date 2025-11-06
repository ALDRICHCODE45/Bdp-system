"use server";

import prisma from "@/core/lib/prisma";
import { makeRoleService } from "../services/makeRoleService";

export const getRolesAction = async () => {
  try {
    const roleService = makeRoleService({ prisma });
    const result = await roleService.getAllWithPermissions();

    // getAllWithPermissions siempre retorna Ok, así que podemos acceder directamente a result.value
    return {
      ok: true,
      data: result.value,
      error: null,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al obtener roles",
      data: [],
    };
  }
};
