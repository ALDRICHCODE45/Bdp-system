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
 * @param initialData - Optional SSR-prefetched data for the base query.
 */
export const useMovimientos = (
  params: MovimientoFilterInput,
  initialData?: MovimientoListDto,
  initialDataUpdatedAt?: number,
) => {
  const isBaseQuery =
    (params.page ?? 1) === 1 &&
    (params.size ?? 20) === 20 &&
    (!params.tipo || params.tipo === "ALL") &&
    !params.search &&
    !params.sortBy &&
    !params.sortDir &&
    (params.estado?.length ?? 0) === 0 &&
    (params.categoria?.length ?? 0) === 0 &&
    (params.titular?.length ?? 0) === 0 &&
    (params.formaPago?.length ?? 0) === 0 &&
    (params.cargoAbono?.length ?? 0) === 0 &&
    (params.facturadoPor?.length ?? 0) === 0 &&
    (params.proveedorId?.length ?? 0) === 0 &&
    (params.clienteId?.length ?? 0) === 0 &&
    (params.solicitanteId?.length ?? 0) === 0 &&
    (params.autorizadorId?.length ?? 0) === 0 &&
    !params.fechaOperacionFrom &&
    !params.fechaOperacionTo &&
    !params.fechaCorteFrom &&
    !params.fechaCorteTo &&
    params.montoMin == null &&
    params.montoMax == null;

  const applicableInitialData = isBaseQuery ? initialData : undefined;

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
    initialData: applicableInitialData,
    initialDataUpdatedAt: applicableInitialData ? initialDataUpdatedAt : undefined,
  });
};
