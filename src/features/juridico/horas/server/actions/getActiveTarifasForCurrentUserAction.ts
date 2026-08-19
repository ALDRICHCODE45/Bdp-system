"use server";

import { auth } from "@/core/lib/auth/auth";
import prisma from "@/core/lib/prisma";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { makeTarifaAbogadoAsuntoService } from "@/features/juridico/tarifas/server/services/makeTarifaAbogadoAsuntoService";
import type { ActiveTarifaDto } from "@/features/juridico/tarifas/server/dtos/TarifaAbogadoAsuntoDto.dto";

const ADMIN_SOCIO_ROLES = new Set(["administrador", "socio"]);

/**
 * Devuelve las tarifas activas relevantes para el sheet de horas.
 *
 * - Abogado: solo sus propias tarifas activas.
 * - Administrador/socio: todas las tarifas activas (para que puedan
 *   registrar a nombre de cualquier abogado o, más adelante, ver la
 *   matriz sin cambiar de tab).
 *
 * Permiso: cualquier usuario que pueda REGISTRAR o GESTIONAR horas
 * (no requiere permiso de tarifas — el sheet de horas lo necesita
 * para validar la disponibilidad de asunto).
 */
export const getActiveTarifasForCurrentUserAction = async (): Promise<
  { ok: true; data: ActiveTarifaDto[] } | { ok: false; error: string }
> => {
  await requireAnyPermission(
    [
      PermissionActions["juridico-horas"].registrar,
      PermissionActions["juridico-horas"].gestionar,
    ],
    "No tienes permiso para registrar horas",
  );

  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false as const, error: "No autenticado" };
  }

  const service = makeTarifaAbogadoAsuntoService({ prisma });

  const isAdminOrSocio = ADMIN_SOCIO_ROLES.has(
    (session.user.role ?? "").toString().toLowerCase(),
  );

  try {
    if (isAdminOrSocio) {
      const result = await service.getAllActive();
      if (!result.ok)
        return { ok: false as const, error: result.error.message };
      return {
        ok: true as const,
        data: result.value.map((t) => ({
          id: t.id,
          usuarioId: t.usuarioId,
          asuntoJuridicoId: t.asuntoJuridicoId,
          tarifaHora: t.tarifaHora.toString(),
        })),
      };
    }

    const result = await service.getActiveByUsuario(session.user.id);
    if (!result.ok) return { ok: false as const, error: result.error.message };
    return {
      ok: true as const,
      data: result.value.map((t) => ({
        id: t.id,
        usuarioId: t.usuarioId,
        asuntoJuridicoId: t.asuntoJuridicoId,
        tarifaHora: t.tarifaHora.toString(),
      })),
    };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener tarifas activas",
    };
  }
};
