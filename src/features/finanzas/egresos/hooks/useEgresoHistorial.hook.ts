"use client";
import { useQuery } from "@tanstack/react-query";
import { getEgresoHistorialAction } from "../server/actions/getEgresoHistorialAction";
import { EgresoHistorialDto } from "../server/dtos/EgresoHistorialDto.dto";

export const useEgresoHistorial = (
  egresoId: string,
  enabled: boolean = true
) => {
  return useQuery<EgresoHistorialDto[]>({
    queryKey: ["egreso-historial", egresoId],
    queryFn: async () => {
      const result = await getEgresoHistorialAction(egresoId);
      if (!result.ok || !result.data) {
        throw new Error(result.error || "Error al cargar historial");
      }
      return result.data;
    },
    enabled: enabled && !!egresoId,
  });
};

