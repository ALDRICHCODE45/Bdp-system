"use server";
import { revalidatePath } from "next/cache";
import { CreateAsistenciaDto } from "../Dtos/CreateAsistenciaDto.Dto";
import { makeAsistenciaService } from "../services/makeAsistenciaService";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { createAsistenciaServerSchema } from "../../schemas/createAsistenciaServerSchema.schema";

export const createAsistenciaAction = async (input: CreateAsistenciaDto) => {
  // Server-side shape validation. The client form schema (email, tipo) is
  // intentionally left untouched; the wire payload is the DTO (tipo,
  // fecha, correo) and we re-validate here so malformed input never
  // reaches the service or the DB.
  const parsed = createAsistenciaServerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  // Verificar permiso antes de continuar
  await requireAnyPermission(
    [
      PermissionActions.asistencias.crear,
      PermissionActions.asistencias.gestionar,
    ],
    "No tienes permiso para crear asistencias"
  );
  const asistenciaService = makeAsistenciaService({ prisma });

  const result = await asistenciaService.create(input);

  if (!result.ok) {
    return { ok: false, message: result.error.message };
  }
  revalidatePath("/asistencias");
  return { ok: true };
};
