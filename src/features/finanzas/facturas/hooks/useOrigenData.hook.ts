"use client";
import { useQuery } from "@tanstack/react-query";
import { getOrigenDataAction } from "../server/actions/getOrigenDataAction";

export const useOrigenData = (
  tipoOrigen: "INGRESO" | "EGRESO",
  origenId: string,
  enabled: boolean
) => {
  return useQuery({
    queryKey: ["origen-data", tipoOrigen, origenId],
    queryFn: async () => {
      const result = await getOrigenDataAction(tipoOrigen, origenId);
      if (!result.ok || !result.data) {
        throw new Error(result.error || "Error al cargar datos del origen");
      }
      return result.data;
    },
    enabled: enabled && !!origenId && !!tipoOrigen,
  });
};

