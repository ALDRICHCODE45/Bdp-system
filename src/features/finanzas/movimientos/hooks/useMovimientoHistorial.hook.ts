"use client";

import { useQuery } from "@tanstack/react-query";
import { getMovimientoHistorialAction } from "../server/actions/getMovimientoHistorialAction";
import type { MovimientoHistorialDto } from "../server/dtos/MovimientoHistorialDto.dto";

/**
 * Fetches the change history for a specific movimiento.
 * Only enabled when `movimientoId` is truthy.
 */
export const useMovimientoHistorial = (
  movimientoId: string | undefined,
  enabled: boolean = true
) => {
  return useQuery<MovimientoHistorialDto[]>({
    queryKey: ["movimientos", movimientoId, "historial"],
    queryFn: async () => {
      const result = await getMovimientoHistorialAction({
        movimientoId: movimientoId!,
      });
      if (!result.ok) {
        throw new Error(result.error || "Error al cargar historial");
      }
      return result.data;
    },
    enabled: enabled && !!movimientoId,
  });
};
