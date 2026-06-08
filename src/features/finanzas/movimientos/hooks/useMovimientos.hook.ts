"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  getMovimientosAction,
  type MovimientoFilterInput,
} from "../server/actions/getMovimientosAction";
import type { MovimientoListDto } from "../server/dtos/MovimientoListDto.dto";

/**
 * Fetches a paginated, filtered, sorted list of movimientos.
 *
 * @param params - Filter / pagination / sort params forwarded to the server action.
 */
export const useMovimientos = (params: MovimientoFilterInput) => {
  return useQuery<MovimientoListDto>({
    queryKey: ["movimientos", params],
    queryFn: async () => {
      const result = await getMovimientosAction(params);
      if (!result.ok) {
        throw new Error(result.error || "Error al cargar movimientos");
      }
      return result.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};
