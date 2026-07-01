"use client";

import { useQuery } from "@tanstack/react-query";
import { getColaboradorStatusCountsAction } from "../server/actions/getColaboradorStatusCountsAction";

/**
 * Hook: total counts per ColaboradorEstado (single groupBy).
 *
 * Used to populate the Activos / En licencia tab badges.
 */
export function useColaboradorStatusCounts() {
  return useQuery({
    queryKey: ["colaboradores-status-counts"],
    queryFn: async () => {
      const result = await getColaboradorStatusCountsAction();
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
    staleTime: 30_000,
  });
}