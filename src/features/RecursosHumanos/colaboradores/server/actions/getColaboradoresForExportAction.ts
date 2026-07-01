"use server";

import { makeColaboradorService } from "../services/makeColaboradorService";
import { toColaboradorDtoArray } from "../mappers/colaboradorMapper";
import prisma from "@/core/lib/prisma";
import { requireAnyPermission } from "@/core/lib/permissions/server-permissions-guard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import type { ColaboradorDto } from "../dtos/ColaboradorDto.dto";
import type {
  ColaboradoresFilterParams,
  ColaboradorEstadoFilter,
} from "../../types/ColaboradoresFilterParams";

const ALLOWED_STATUSES = new Set<ColaboradorEstadoFilter>([
  "CONTRATADO",
  "DESPEDIDO",
  "EN_LICENCIA",
]);

/**
 * Server Action: fetch all colaboradores matching the active filters, for export.
 *
 * Honors the same status + search filter as `getPaginatedColaboradoresAction` —
 * cap1 req5: "Export MUST honor the active tab filter".
 *
 * No pagination — exports the entire filtered set (Excel can handle thousands).
 * Gated to usuarios con permiso de acceso o gestión (no Capturador): export
 * expone PII (correo) por lo que requiere el mismo nivel que el listado.
 */
export async function getColaboradoresForExportAction(
  params: Omit<ColaboradoresFilterParams, "page" | "pageSize" | "sortBy" | "sortOrder">
): Promise<
  | { ok: true; data: ColaboradorDto[] }
  | { ok: false; error: string }
> {
  // Defensa en profundidad: Capturador no tiene ninguno de estos permisos → bloqueado
  await requireAnyPermission(
    [
      PermissionActions.colaboradores.acceder,
      PermissionActions.colaboradores.gestionar,
    ],
    "No tienes permiso para exportar colaboradores",
  );

  try {
    const status = params.status?.filter((s) => ALLOWED_STATUSES.has(s));
    const service = makeColaboradorService({ prisma });
    const result = await service.getPaginated({
      page: 1,
      pageSize: 10_000, // trae todo el set filtrado en una sola consulta
      status: status && status.length > 0 ? status : undefined,
      search: params.search?.trim() ? params.search.trim() : undefined,
    });
    if (!result.ok) {
      return { ok: false, error: result.error.message };
    }
    const dtos = toColaboradorDtoArray(result.value.data);
    return { ok: true, data: dtos };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener colaboradores para exportación",
    };
  }
}