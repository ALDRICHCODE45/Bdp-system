"use server";

import { makeFacturaService } from "../services/makeFacturaService";
import { toFacturaDtoArray } from "../mappers/facturaMapper";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import type { FacturaDto } from "../dtos/FacturaDto.dto";
import type { FacturasFilterParams } from "../../types/FacturasFilterParams";

/**
 * Trae TODOS los registros que coinciden con los filtros activos (sin paginación).
 * Exclusivo para exportación — no usar para renderizado de tabla.
 *
 * A diferencia de getPaginatedFacturasAction, no aplica el cap de 100 filas
 * y no devuelve metadata de paginación.
 *
 * Solo accesible para usuarios con permiso de acceso o gestión (no Capturador).
 */
export const getFacturasForExportAction = async (
  filters: Omit<FacturasFilterParams, "page" | "pageSize">
): Promise<{ ok: true; data: FacturaDto[] } | { ok: false; error: string }> => {
  // Defensa en profundidad: Capturador no tiene ninguno de estos permisos → bloqueado
  await requireAnyPermission(
    [PermissionActions.facturas.acceder, PermissionActions.facturas.gestionar],
    "No tienes permiso para exportar facturas"
  );

  const service = makeFacturaService({ prisma });

  // pageSize grande para traer todo en una sola consulta
  const result = await service.getPaginated({
    ...filters,
    page: 1,
    pageSize: 10_000,
  });

  if (!result.ok) {
    return { ok: false, error: result.error.message };
  }

  return { ok: true, data: toFacturaDtoArray(result.value.data) };
};
