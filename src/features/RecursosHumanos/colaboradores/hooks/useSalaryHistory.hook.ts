"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  adjustSalaryAction,
  listSalaryHistoryAction,
} from "../server/actions/salaryHistoryActions";
import type { SalaryHistoryDto } from "../server/dtos/SalaryHistoryDto.dto";
import type { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";

/**
 * TanStack Query hooks for the SalaryHistory feature.
 *
 * Cache layout:
 * - `["salary-history", colaboradorId]` — the audit list for one colaborador.
 *
 * Mutations invalidate that key on success; we also invalidate the
 * `["colaborador", colaboradorId]` family of queries so the live `sueldo`
 * field in any cached `ColaboradorDto` (Resumen tab, KPI card, etc.) is
 * re-fetched and the user immediately sees the new amount.
 */

export const salaryHistoryQueryKey = (colaboradorId: string) =>
  ["salary-history", colaboradorId] as const;

export function useSalaryHistory(colaboradorId: string) {
  return useQuery<SalaryHistoryDto[]>({
    queryKey: salaryHistoryQueryKey(colaboradorId),
    queryFn: async () => {
      const result = await listSalaryHistoryAction(colaboradorId);
      if (!result.ok) {
        throw new Error(result.error || "Error al cargar historial de sueldo");
      }
      return result.data;
    },
    enabled: Boolean(colaboradorId),
    staleTime: 30_000,
  });
}

export function useAdjustSalary(colaboradorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      // Ensure the route-bound id is always present in the FormData
      // regardless of caller ergonomics.
      if (!formData.get("colaboradorId")) {
        formData.set("colaboradorId", colaboradorId);
      }
      const result = await adjustSalaryAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al registrar el ajuste");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Ajuste de sueldo registrado");
      await queryClient.invalidateQueries({
        queryKey: salaryHistoryQueryKey(colaboradorId),
      });
      // The live Colaborador.sueldo changed too — bust any cached DTO so the
      // Resumen KPI card picks up the new monto without a manual reload.
      await queryClient.invalidateQueries({
        queryKey: ["colaborador", colaboradorId],
      });
      await queryClient.invalidateQueries({
        queryKey: colaboradorListKey(),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al registrar el ajuste");
    },
  });
}

/**
 * Helper to invalidate every cached variant of the colaboradores list query
 * — the salary change is visible in the listing (if it renders sueldo) so
 * we want the next render to refetch.
 *
 * We use a broad query key prefix that mirrors the listing hooks
 * (`useColaboradores`) without forcing an import cycle.
 */
function colaboradorListKey(): readonly string[] {
  return ["colaboradores"];
}

// Re-export the DTO type alias so consumers (CompensacionTab) don't have to
// dig into server/dtos/ for type-only imports.
export type { SalaryHistoryDto, ColaboradorDto };