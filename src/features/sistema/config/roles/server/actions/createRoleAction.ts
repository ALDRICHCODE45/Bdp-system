"use server";

import { revalidatePath } from "next/cache";
import { makeRoleService } from "../services/makeRoleService";
import { createRoleSchema } from "../validators/createRoleSchema";
import prisma from "@/core/lib/prisma";

export const createRoleAction = async (input: FormData) => {
  const name = input.get("name");

  // Validación de entrada
  const parsed = createRoleSchema.safeParse({ name });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Error de validación",
    };
  }

  const roleService = makeRoleService({ prisma });
  const result = await roleService.create(parsed.data);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  revalidatePath("/config/permisos");
  return { ok: true };
};
