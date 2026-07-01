"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  adjustPositionAction,
  listPositionHistoryAction,
} from "../server/actions/positionHistoryActions";
import type { PositionHistoryDto } from "../server/dtos/PositionHistoryDto.dto";

/**
 * TanStack Query hooks for the PositionHistory feature.
 *
 * Cache layout:
 * - `["position-history", colaboradorId]` — the audit list for one colaborador.
 *
 * Mutations invalidate that key on success; we also invalidate the cached
 * `ColaboradorDto` so the LaboralTab reflects the freshly-updated position
 * fields without a manual reload.
 *
 * NOTE: P3's `ColaboradorService.update` also writes a PositionHistory row
 * when the generic EditColaboradorSheet updates cargo/departamento/nivel.
 * That code path is independent from this `adjustPosition` action — the
 * Compensación tab does NOT go through the edit sheet, so no double-write
 * happens for one logical change.
 */

export const positionHistoryQueryKey = (colaboradorId: string) =>
  ["position-history", colaboradorId] as const;

export function usePositionHistory(colaboradorId: string) {
  return useQuery<PositionHistoryDto[]>({
    queryKey: positionHistoryQueryKey(colaboradorId),
    queryFn: async () => {
      const result = await listPositionHistoryAction(colaboradorId);
      if (!result.ok) {
        throw new Error(
          result.error || "Error al cargar historial de posición"
        );
      }
      return result.data;
    },
    enabled: Boolean(colaboradorId),
    staleTime: 30_000,
  });
}

export function useAdjustPosition(colaboradorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      if (!formData.get("colaboradorId")) {
        formData.set("colaboradorId", colaboradorId);
      }
      const result = await adjustPositionAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al registrar el ajuste");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Cambio de posición registrado");
      await queryClient.invalidateQueries({
        queryKey: positionHistoryQueryKey(colaboradorId),
      });
      // Live position fields changed — bust cached Colaborador DTOs so the
      // LaboralTab "Posición actual" card reflects the new cargo/nivel/
      // departamento without a manual reload.
      await queryClient.invalidateQueries({
        queryKey: ["colaborador", colaboradorId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al registrar el ajuste");
    },
  });
}

export type { PositionHistoryDto };