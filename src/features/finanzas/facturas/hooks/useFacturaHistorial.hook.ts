"use client";
import { useQuery } from "@tanstack/react-query";
import { getFacturaHistorialAction } from "../server/actions/getFacturaHistorialAction";
import { FacturaHistorialDto } from "../server/dtos/FacturaHistorialDto.dto";

export const useFacturaHistorial = (
  facturaId: string,
  enabled: boolean = true
) => {
  return useQuery<FacturaHistorialDto[]>({
    queryKey: ["factura-historial", facturaId],
    queryFn: async () => {
      const result = await getFacturaHistorialAction(facturaId);
      if (!result.ok || !result.data) {
        throw new Error(result.error || "Error al cargar historial");
      }
      return result.data;
    },
    enabled: enabled && !!facturaId,
  });
};

