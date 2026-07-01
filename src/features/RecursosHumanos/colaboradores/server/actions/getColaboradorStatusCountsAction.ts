"use server";

import { makeColaboradorService } from "../services/makeColaboradorService";
import prisma from "@/core/lib/prisma";

export type ColaboradorStatusCountsAction = {
  CONTRATADO: number;
  DESPEDIDO: number;
  EN_LICENCIA: number;
};

/**
 * Server Action: total counts per status (single groupBy).
 *
 * Used to render the tab badges (Activos / En licencia counts).
 * Currently does not respect the active search/status filter — those tabs
 * show overall population counts so users can see how many records exist in
 * each bucket before clicking. (Mirrors Facturas `getFacturaStatusCountsAction`.)
 */
export async function getColaboradorStatusCountsAction(): Promise<
  | { ok: true; data: ColaboradorStatusCountsAction }
  | { ok: false; error: string }
> {
  try {
    const service = makeColaboradorService({ prisma });
    const result = await service.countByStatus();
    if (!result.ok) {
      return { ok: false, error: result.error.message };
    }
    return { ok: true, data: result.value };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Error al obtener conteos por estado",
    };
  }
}