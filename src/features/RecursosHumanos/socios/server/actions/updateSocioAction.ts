"use server";
import { revalidatePath } from "next/cache";
import { makeSocioService } from "../services/makeSocioService";
import { updateSocioSchema } from "../validators/updateSocioSchema";
import { toSocioDto } from "../mappers/socioMapper";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const updateSocioAction = async (input: FormData) => {
  // Verificar permiso antes de continuar
  await requireAnyPermission(
    [
      PermissionActions.socios.editar,
      PermissionActions.socios.gestionar,
    ],
    "No tienes permiso para editar socios"
  );
  const id = input.get("id");
  const nombre = input.get("nombre");
  const email = input.get("email");
  const telefono = input.get("telefono") || null;
  const activo = input.get("activo") === "true";
  const fechaIngresoString = input.get("fechaIngreso");
  const departamento = input.get("departamento") || null;
  const notas = input.get("notas") || null;

  const fechaIngreso = fechaIngresoString
    ? new Date(fechaIngresoString as string)
    : new Date();

  // Validación de entrada
  const parsed = updateSocioSchema.parse({
    id,
    nombre,
    email,
    telefono,
    activo,
    fechaIngreso,
    departamento,
    notas,
  });

  const socioService = makeSocioService({ prisma });
  const result = await socioService.update(parsed);

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  const socioDto = toSocioDto(result.value);
  revalidatePath("/socios");
  return { ok: true, data: socioDto };
};
