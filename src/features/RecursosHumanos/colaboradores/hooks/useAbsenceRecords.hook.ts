"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createAbsenceAction,
  listAbsenceRecordsAction,
} from "../server/actions/absenceRecordActions";
import type { AbsenceRecordDto } from "../server/dtos/AbsenceRecordDto.dto";

/**
 * TanStack Query hooks for the AbsenceRecord feature (cap9 req3 + cap13).
 *
 * Cache layout:
 * - `["absence-records", colaboradorId]` — the registry list for one
 *   colaborador. The list is read-only and gated by `colaboradores:acceder`
 *   on the server; the mutation is gated by the NEW
 *   `colaboradores:gestionar-ausencias` permission and refreshes the
 *   registry on success.
 *
 * Mutations invalidate that key on success so the list refreshes without a
 * page reload after each registration.
 */

export const absenceRecordsQueryKey = (colaboradorId: string) =>
  ["absence-records", colaboradorId] as const;

export function useAbsenceRecords(colaboradorId: string) {
  return useQuery<AbsenceRecordDto[]>({
    queryKey: absenceRecordsQueryKey(colaboradorId),
    queryFn: async () => {
      const result = await listAbsenceRecordsAction(colaboradorId);
      if (!result.ok) {
        throw new Error(result.error || "Error al cargar las ausencias");
      }
      return result.data;
    },
    enabled: Boolean(colaboradorId),
    staleTime: 30_000,
  });
}

/**
 * Register a new absence. The Server Action calls
 * `requireAnyPermission(['colaboradores:gestionar-ausencias'])` first
 * (CC1/CC8); the UI additionally wraps the trigger in `<PermissionGuard>`.
 * `dias` is read from the form via a hidden input — the SERVER recomputes
 * the value via `differenceInCalendarDays + 1`, so a tampered client
 * cannot force a negative `dias`.
 */
export function useCreateAbsence(colaboradorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      if (!formData.get("colaboradorId")) {
        formData.set("colaboradorId", colaboradorId);
      }
      const result = await createAbsenceAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al registrar la ausencia");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Ausencia registrada");
      await queryClient.invalidateQueries({
        queryKey: absenceRecordsQueryKey(colaboradorId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al registrar la ausencia");
    },
  });
}

export type { AbsenceRecordDto };