"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/core/lib/auth/auth";
import prisma from "@/core/lib/prisma";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { makeTarifaAbogadoAsuntoService } from "../services/makeTarifaAbogadoAsuntoService";
import { updateTarifaSchema } from "../validators/tarifasValidator";
import { toTarifaAbogadoAsuntoDto } from "../mappers/tarifaAbogadoAsuntoMapper";

export const updateTarifaAction = async (input: unknown) => {
  await requireAnyPermission(
    [PermissionActions["juridico-tarifas"].gestionar],
    "No tienes permiso para administrar tarifas",
  );

  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "No autenticado" };
  }

  const parsed = updateTarifaSchema.parse(input);
  const service = makeTarifaAbogadoAsuntoService({ prisma });

  const result = await service.update({
    id: parsed.id,
    tarifaHora: parsed.tarifaHora,
    updatedById: session.user.id,
    motivo: parsed.motivo ?? null,
  });

  if (!result.ok) return { ok: false as const, error: result.error.message };
  revalidatePath("/juridico/tarifas");
  return { ok: true as const, data: toTarifaAbogadoAsuntoDto(result.value) };
};
