"use client";

import { useQuery } from "@tanstack/react-query";
import { getDistinctTitularesAction } from "../server/actions/getDistinctTitularesAction";

/**
 * Fetches the distinct list of titulares from movimientos.
 * Stale time set to 5 minutes since titulares rarely change.
 */
export const useDistinctTitulares = () => {
  return useQuery<string[]>({
    queryKey: ["movimientos", "titulares"],
    queryFn: async () => {
      const result = await getDistinctTitularesAction();
      if (!result.ok) {
        throw new Error(result.error || "Error al cargar titulares");
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
