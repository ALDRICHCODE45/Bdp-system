"use server";
import { revalidatePath } from "next/cache";
// import { createAsistenciaSchema } from "../../schemas/createAsistenciaSchema.schema";
import { CreateAsistenciaDto } from "../Dtos/CreateAsistenciaDto.Dto";
import { makeAsistenciaService } from "../services/makeAsistenciaService";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const createAsistenciaAction = async (input: CreateAsistenciaDto) => {
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
};
