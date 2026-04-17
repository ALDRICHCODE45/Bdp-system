"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/core/lib/auth/auth";
import { makeAutorizacionEdicionService } from "../services/makeAutorizacionEdicionService";
import { solicitarEdicionSchema } from "../validators/solicitarEdicionSchema";
import { toAutorizacionEdicionDto } from "../mappers/autorizacionEdicionMapper";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { inngest } from "@/core/shared/inngest/inngest";
import { InngestEvents } from "@/core/shared/inngest/constants/inngest-events";

export const solicitarEdicionAction = async (input: unknown) => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-horas"]["solicitar-edicion"],
      PermissionActions["juridico-horas"].gestionar,
    ],
    "No tienes permiso para solicitar edición de horas"
  );

  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "No autenticado" };
  }

  const parsed = solicitarEdicionSchema.parse(input);

  const service = makeAutorizacionEdicionService({ prisma });
  const result = await service.solicitar({
    registroHoraId: parsed.registroHoraId,
    solicitanteId: session.user.id,
    justificacion: parsed.justificacion,
  });

  if (!result.ok) return { ok: false as const, error: result.error.message };

  revalidatePath("/juridico/horas");

  // Fire-and-forget Inngest event (non-critical)
  try {
    await inngest.send({
      name: InngestEvents.juridico.editRequestCreated,
      data: {
        autorizacionId: result.value.id,
        solicitanteNombre: session.user.name ?? "",
        solicitanteEmail: session.user.email ?? "",
        registroHoraId: parsed.registroHoraId,
        justificacion: parsed.justificacion,
        semana: result.value.registroHora.semana,
        ano: result.value.registroHora.ano,
      },
    });
  } catch (e) {
    console.error("Failed to send Inngest event editRequestCreated:", e);
  }

  return { ok: true as const, data: toAutorizacionEdicionDto(result.value) };
};
