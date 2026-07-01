"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getVacationBalanceAction,
  setVacationBalanceAction,
} from "../server/actions/vacationBalanceActions";
import type { VacationBalanceDto } from "../server/dtos/VacationBalanceDto.dto";

/**
 * TanStack Query hooks for the VacationBalance feature (cap9 req1).
 *
 * Cache layout:
 * - `["vacation-balance", colaboradorId]` — the 1:1 balance for one
 *   colaborador, or `null` when no row exists. The donut's empty state
 *   and the Resumen "Sin registrar" KPI both rely on the `null` signal
 *   (cap3 req4 + cap9 req5 — NEVER fabricate a "0/0" total).
 *
 * Mutations invalidate that key on success so the donut AND the Resumen
 * KPI both refresh without a page reload.
 */

export const vacationBalanceQueryKey = (colaboradorId: string) =>
  ["vacation-balance", colaboradorId] as const;

export function useVacationBalance(
  colaboradorId: string,
  initialData?: VacationBalanceDto | null
) {
  return useQuery<VacationBalanceDto | null>({
    queryKey: vacationBalanceQueryKey(colaboradorId),
    queryFn: async () => {
      const result = await getVacationBalanceAction(colaboradorId);
      if (!result.ok) {
        throw new Error(
          result.error || "Error al cargar el balance de vacaciones"
        );
      }
      return result.data;
    },
    enabled: Boolean(colaboradorId),
    staleTime: 30_000,
    // Use the RSC-prefetched value as the FIRST render seed so the donut
    // does not flash an empty state on tab activation. The query will
    // re-fetch in the background after mount (staleTime 30s).
    initialData: initialData ?? undefined,
  });
}

/**
 * Manually set the diasDisponibles + diasTomados. The Server Action calls
 * `requireAnyPermission(['colaboradores:gestionar-ausencias'])` first
 * (CC1/CC8); the UI additionally wraps the trigger in `<PermissionGuard>`.
 */
export function useSetVacationBalance(colaboradorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      if (!formData.get("colaboradorId")) {
        formData.set("colaboradorId", colaboradorId);
      }
      const result = await setVacationBalanceAction(formData);
      if (!result.ok) {
        throw new Error(
          result.error || "Error al registrar el balance de vacaciones"
        );
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Balance de vacaciones actualizado");
      await queryClient.invalidateQueries({
        queryKey: vacationBalanceQueryKey(colaboradorId),
      });
      // Bust the Resumen tab's KPI as well — the `vacaciones` payload is
      // server-prefetched, but a revalidatePath in the action handles the
      // navigation back to the Resumen tab.
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al registrar el balance");
    },
  });
}

export type { VacationBalanceDto };