"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/core/lib/auth/auth";
import { makeAutorizacionEdicionService } from "../services/makeAutorizacionEdicionService";
import { toAutorizacionEdicionDto } from "../mappers/autorizacionEdicionMapper";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { inngest } from "@/core/shared/inngest/inngest";
import { InngestEvents } from "@/core/shared/inngest/constants/inngest-events";
import { z } from "zod";

const autorizarEdicionSchema = z.object({
  autorizacionId: z
    .string({ message: "El ID de la solicitud es requerido" })
    .uuid({ message: "ID de solicitud inválido" }),
});

export const autorizarEdicionAction = async (input: unknown) => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-horas"]["autorizar-edicion"],
      PermissionActions["juridico-horas"].gestionar,
    ],
    "No tienes permiso para autorizar solicitudes de edición"
  );

  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "No autenticado" };
  }

  const parsed = autorizarEdicionSchema.parse(input);

  const service = makeAutorizacionEdicionService({ prisma });
  const result = await service.autorizar(parsed.autorizacionId, session.user.id);

  if (!result.ok) return { ok: false as const, error: result.error.message };

  revalidatePath("/juridico/horas");

  // Fire-and-forget Inngest event (non-critical)
  try {
    await inngest.send({
      name: InngestEvents.juridico.editRequestAuthorized,
      data: {
        autorizacionId: result.value.id,
        registroHoraId: result.value.registroHoraId,
        solicitanteEmail: result.value.solicitante.email ?? "",
        solicitanteNombre: result.value.solicitante.name ?? "",
        semana: result.value.registroHora.semana,
        ano: result.value.registroHora.ano,
      },
    });
  } catch (e) {
    console.error("Failed to send Inngest event editRequestAuthorized:", e);
  }

  return { ok: true as const, data: toAutorizacionEdicionDto(result.value) };
};
