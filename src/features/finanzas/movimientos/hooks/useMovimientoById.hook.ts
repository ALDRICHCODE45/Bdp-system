"use client";

import { useQuery } from "@tanstack/react-query";
import { getMovimientoByIdAction } from "../server/actions/getMovimientoByIdAction";
import type { MovimientoDto } from "../server/dtos/MovimientoDto.dto";

/**
 * Fetches a single movimiento by ID.
 * Only enabled when `id` is truthy.
 */
export const useMovimientoById = (id: string | undefined) => {
  return useQuery<MovimientoDto | null>({
    queryKey: ["movimientos", { id }],
    queryFn: async () => {
      const result = await getMovimientoByIdAction({ id: id! });
      if (!result.ok) {
        throw new Error(result.error || "Error al cargar movimiento");
      }
      return result.data;
    },
    enabled: !!id,
  });
};
