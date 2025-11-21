"use client";
import { useQuery } from "@tanstack/react-query";
import { getIngresoHistorialAction } from "../server/actions/getIngresoHistorialAction";
import { IngresoHistorialDto } from "../server/dtos/IngresoHistorialDto.dto";

export const useIngresoHistorial = (
  ingresoId: string,
  enabled: boolean = true
) => {
  return useQuery<IngresoHistorialDto[]>({
    queryKey: ["ingreso-historial", ingresoId],
    queryFn: async () => {
      const result = await getIngresoHistorialAction(ingresoId);
      if (!result.ok || !result.data) {
        throw new Error(result.error || "Error al cargar historial");
      }
      return result.data;
    },
    enabled: enabled && !!ingresoId,
  });
};

