"use server";

import prisma from "@/core/lib/prisma";
import { auth } from "@/core/lib/auth/auth";
import { buildFacturasWhereClause } from "../repositories/PrismaFacturaRepository.repository";
import type { FacturasFilterParams } from "../../types/FacturasFilterParams";
import { isCapturadorOnly } from "@/features/finanzas/facturas/helpers/capturadorUtils";

export type FacturaStatusCounts = {
  vigente: number;
  cancelada: number;
};

/**
 * Cuenta facturas agrupadas por status en una sola query eficiente.
 *
 * Respeta todos los filtros activos EXCEPTO `status`, de manera que cada tab
 * siempre muestre su propio conteo independientemente de qué tabs estén seleccionados.
 *
 * Delega la construcción del WHERE a `buildFacturasWhereClause` — el mismo
 * helper que usa la tabla principal — para garantizar que los conteos siempre
 * reflejen exactamente los mismos registros que la vista filtrada.
 *
 * Para capturadores, inyecta filtro de ownership antes de construir el WHERE.
 */
export async function getFacturaStatusCountsAction(
  filters: Omit<FacturasFilterParams, "page" | "pageSize" | "sortBy" | "sortOrder" | "status">
): Promise<{ ok: true; data: FacturaStatusCounts } | { ok: false; error: string }> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const userPermissions = session?.user?.permissions ?? [];

    // Si es capturador, forzar filtro de ownership — no puede ser sobreescrito por el front
    const ownershipFilters: Partial<typeof filters> =
      isCapturadorOnly(userPermissions) && userId
        ? { ingresadoPor: [userId] }
        : {};

    // `buildFacturasWhereClause` acepta Omit<..., "page"|"pageSize"|"sortBy"|"sortOrder">
    // lo que incluye `status`. Pasamos los filtros tal cual (sin status) y la función
    // simplemente no agrega condición de status cuando el campo está ausente.
    const where = buildFacturasWhereClause({ ...filters, ...ownershipFilters });

    // Una sola query groupBy — mucho más eficiente que 4 queries separadas
    const rows = await prisma.factura.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
    });

    const counts: FacturaStatusCounts = {
      vigente: 0,
      cancelada: 0,
    };

    for (const row of rows) {
      const key = row.status.toLowerCase() as keyof FacturaStatusCounts;
      if (key in counts) {
        counts[key] = row._count._all;
      }
    }

    return { ok: true, data: counts };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error al obtener conteos",
    };
  }
}
