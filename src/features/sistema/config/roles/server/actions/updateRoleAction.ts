"use server";

import { revalidatePath } from "next/cache";
import { updateRoleSchema } from "../validators/updateRoleSchema";
import prisma from "@/core/lib/prisma";
import { makeRoleService } from "../services/makeRoleService";

// Helper para extraer valores tipados del FormData
function getFormDataValues(formData: FormData) {
  const id = formData.get("id");
  const name = formData.get("name");

  return {
    id: typeof id === "string" ? id : "",
    name: typeof name === "string" ? name : "",
  };
}

export const updateRoleAction = async (input: FormData) => {
  const formValues = getFormDataValues(input);

  // Validación de entrada
  const parsed = updateRoleSchema.safeParse({
    id: formValues.id,
    name: formValues.name,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Error de validación",
    };
  }

  try {
    const roleService = makeRoleService({ prisma });
    const result = await roleService.update(parsed.data);

    if (!result.ok) {
      return { ok: false, error: result.error.message };
    }

    revalidatePath("/config/permisos");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al actualizar rol",
    };
  }
};

