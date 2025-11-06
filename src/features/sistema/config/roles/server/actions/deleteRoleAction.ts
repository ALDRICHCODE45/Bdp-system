"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/core/lib/prisma";
import { makeRoleService } from "../services/makeRoleService";

export const deleteRoleAction = async (roleId: string) => {
  try {
    const roleService = makeRoleService({ prisma });
    const result = await roleService.delete(roleId);

    if (!result.ok) {
      return {
        ok: false,
        error: result.error.message,
      };
    }

    revalidatePath("/config/permisos");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al eliminar rol",
    };
  }
};

