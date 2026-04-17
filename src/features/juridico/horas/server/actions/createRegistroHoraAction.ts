"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/core/lib/auth/auth";
import { makeRegistroHoraService } from "../services/makeRegistroHoraService";
import { createRegistroHoraSchema } from "../validators/createRegistroHoraSchema";
import { toRegistroHoraDto } from "../mappers/registroHoraMapper";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { getCurrentWeekInfo } from "@/core/shared/helpers/weekUtils";
import { horasMinutosToDecimal } from "../../helpers/formatHoras";

export const createRegistroHoraAction = async (input: unknown) => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-horas"].registrar,
      PermissionActions["juridico-horas"].gestionar,
    ],
    "No tienes permiso para registrar horas"
  );

  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "No autenticado" };
  }

  const parsed = createRegistroHoraSchema.parse(input);
  const { ano, semana } = getCurrentWeekInfo();

  // Convert hours + minutes to decimal for storage
  const horasDecimal = horasMinutosToDecimal(parsed.horas, parsed.minutos);

  const service = makeRegistroHoraService({ prisma });
  const result = await service.create({
    equipoJuridicoId: parsed.equipoJuridicoId,
    clienteJuridicoId: parsed.clienteJuridicoId,
    asuntoJuridicoId: parsed.asuntoJuridicoId,
    socioId: parsed.socioId,
    horas: horasDecimal,
    descripcion: parsed.descripcion,
    usuarioId: session.user.id,
    ano,
    semana,
  });

  if (!result.ok) return { ok: false as const, error: result.error.message };

  revalidatePath("/juridico/horas");
  return { ok: true as const, data: toRegistroHoraDto(result.value) };
};
