"use server";

import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { makeMovimientoService } from "../services/makeMovimientoService";
import type { MovimientoListItemDto } from "../dtos/MovimientoListDto.dto";
import type { MovimientoFilterParams } from "../repositories/MovimientoRepository.repository";
import type { MovimientoFilterInput } from "./getMovimientosAction";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * El repositorio limita `size` a 200 (MAX_SIZE), por lo que la exportación
 * pagina internamente hasta agotar el set filtrado.
 */
const EXPORT_PAGE_SIZE = 200;

/** Tope defensivo para no exportar un set arbitrariamente grande en un request. */
const MAX_EXPORT_RECORDS = 10_000;

/**
 * Trae TODOS los movimientos que coinciden con los filtros activos (sin
 * paginación) para exportarlos a Excel. No usar para renderizar la tabla.
 *
 * A diferencia de `getMovimientosAction`, no devuelve metadata de paginación ni
 * agregados, y respeta el mismo guard de permisos del listado.
 */
export async function getMovimientosForExportAction(
  input: Omit<MovimientoFilterInput, "page" | "size">,
): Promise<ActionResult<MovimientoListItemDto[]>> {
  try {
    await requireAnyPermission(
      [
        PermissionActions.movimientos.acceder,
        PermissionActions.movimientos.gestionar,
      ],
      "No tienes permiso para exportar movimientos",
    );

    // Convertir las fechas ISO del cliente a Date para el repositorio
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

    const items: MovimientoListItemDto[] = [];
    let page = 1;

    while (items.length < MAX_EXPORT_RECORDS) {
      const result = await service.getAll({
        ...params,
        page,
        size: EXPORT_PAGE_SIZE,
      });

      if (!result.ok) {
        return { ok: false, error: result.error.message };
      }

      const { data, pagination } = result.value;
      items.push(...data);

      const reachedEnd =
        data.length === 0 ||
        items.length >= pagination.total ||
        page >= pagination.totalPages;

      if (reachedEnd) break;

      page += 1;
    }

    return { ok: true, data: items };
  } catch (error) {
    console.error("Error en getMovimientosForExportAction:", error);
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Error desconocido al exportar movimientos",
    };
  }
}
