"use server";

import { auth } from "@/core/lib/auth/auth";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import prisma from "@/core/lib/prisma";
import { makeMovimientoService } from "../services/makeMovimientoService";
import type { MovimientoListDto } from "../dtos/MovimientoListDto.dto";
import type { MovimientoFilterParams } from "../repositories/MovimientoRepository.repository";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Serializable filter input from the client.
 * Date fields arrive as ISO strings and are converted to Date objects.
 */
export type MovimientoFilterInput = Omit<
  MovimientoFilterParams,
  | "fechaOperacionFrom"
  | "fechaOperacionTo"
  | "fechaCorteFrom"
  | "fechaCorteTo"
> & {
  fechaOperacionFrom?: string;
  fechaOperacionTo?: string;
  fechaCorteFrom?: string;
  fechaCorteTo?: string;
};

export async function getMovimientosAction(
  input: MovimientoFilterInput
): Promise<ActionResult<MovimientoListDto>> {
  try {
    await requireAnyPermission([
      PermissionActions.movimientos.acceder,
      PermissionActions.movimientos.gestionar,
    ]);

    const session = await auth();
    if (!session?.user) {
      return { ok: false, error: "No autorizado" };
    }

    // Convert ISO strings to Date objects
    const params: MovimientoFilterParams = {
      ...input,
      fechaOperacionFrom: input.fechaOperacionFrom
        ? new Date(input.fechaOperacionFrom)
        : undefined,
      fechaOperacionTo: input.fechaOperacionTo
        ? new Date(input.fechaOperacionTo)
        : undefined,
      fechaCorteFrom: input.fechaCorteFrom
        ? new Date(input.fechaCorteFrom)
        : undefined,
      fechaCorteTo: input.fechaCorteTo
        ? new Date(input.fechaCorteTo)
        : undefined,
    };

    const service = makeMovimientoService({ prisma });
    const result = await service.getAll(params);

    if (!result.ok) {
      return { ok: false, error: result.error.message };
    }

    return { ok: true, data: result.value };
  } catch (error) {
    console.error("Error en getMovimientosAction:", error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Error desconocido al obtener movimientos",
    };
  }
}
