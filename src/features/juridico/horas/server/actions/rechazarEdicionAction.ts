"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/core/lib/auth/auth";
import { makeAutorizacionEdicionService } from "../services/makeAutorizacionEdicionService";
import { rechazarEdicionSchema } from "../validators/rechazarEdicionSchema";
import { toAutorizacionEdicionDto } from "../mappers/autorizacionEdicionMapper";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";

export const rechazarEdicionAction = async (input: unknown) => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-horas"]["autorizar-edicion"],
      PermissionActions["juridico-horas"].gestionar,
    ],
    "No tienes permiso para rechazar solicitudes de edición"
  );

  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "No autenticado" };
  }

  const parsed = rechazarEdicionSchema.parse(input);

  const service = makeAutorizacionEdicionService({ prisma });
  const result = await service.rechazar(
    parsed.autorizacionId,
    session.user.id,
    parsed.motivoRechazo
  );

  if (!result.ok) return { ok: false as const, error: result.error.message };

  revalidatePath("/juridico/horas");
  return { ok: true as const, data: toAutorizacionEdicionDto(result.value) };
};
