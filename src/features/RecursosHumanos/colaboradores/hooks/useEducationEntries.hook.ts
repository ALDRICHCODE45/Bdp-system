"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createEducationEntryAction,
  deleteEducationEntryAction,
  listEducationEntriesAction,
  reorderEducationEntriesAction,
  updateEducationEntryAction,
} from "../server/actions/educationEntryActions";
import type { EducationEntryDto } from "../server/dtos/EducationEntryDto.dto";

/**
 * TanStack Query hooks for the EducationEntry feature (cap10).
 *
 * Cache layout:
 * - `["education-entries", colaboradorId]` — the CV list for one colaborador.
 *
 * Mutations invalidate that key on success so the list refreshes without a
 * page reload after each add / edit / remove / reorder. Server actions call
 * `requireAnyPermission(['colaboradores:editar'])` first (CC1/CC8); the UI
 * additionally wraps the controls in `<PermissionGuard>` so unauthorized
 * users never see the affordances.
 */

export const educationEntriesQueryKey = (colaboradorId: string) =>
  ["education-entries", colaboradorId] as const;

export function useEducationEntries(colaboradorId: string) {
  return useQuery<EducationEntryDto[]>({
    queryKey: educationEntriesQueryKey(colaboradorId),
    queryFn: async () => {
      const result = await listEducationEntriesAction(colaboradorId);
      if (!result.ok) {
        throw new Error(
          result.error || "Error al cargar la formación académica"
        );
      }
      return result.data;
    },
    enabled: Boolean(colaboradorId),
    staleTime: 30_000,
  });
}

export function useCreateEducationEntry(colaboradorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      // Ensure the route-bound id is always present in the FormData
      // regardless of caller ergonomics.
      if (!formData.get("colaboradorId")) {
        formData.set("colaboradorId", colaboradorId);
      }
      const result = await createEducationEntryAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al crear la entrada");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Entrada de formación agregada");
      await queryClient.invalidateQueries({
        queryKey: educationEntriesQueryKey(colaboradorId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear la entrada");
    },
  });
}

export function useUpdateEducationEntry(colaboradorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await updateEducationEntryAction(formData);
      if (!result.ok) {
        throw new Error(
          result.error || "Error al actualizar la entrada"
        );
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Entrada de formación actualizada");
      await queryClient.invalidateQueries({
        queryKey: educationEntriesQueryKey(colaboradorId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar la entrada");
    },
  });
}

export function useDeleteEducationEntry(colaboradorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteEducationEntryAction(id);
      if (!result.ok) {
        throw new Error(result.error || "Error al eliminar la entrada");
      }
      return id;
    },
    onSuccess: async () => {
      toast.success("Entrada de formación eliminada");
      await queryClient.invalidateQueries({
        queryKey: educationEntriesQueryKey(colaboradorId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar la entrada");
    },
  });
}

/**
 * Bulk reorder the entries for one colaborador (cap10 req3). The hook
 * accepts the new ordered array of ids + collaborator id and forwards the
 * recomputed `orden` values to the action. The repository wraps the writes
 * in a single `$transaction` so a partial reorder is impossible.
 */
export function useReorderEducationEntries(colaboradorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const items = orderedIds.map((id, idx) => ({ id, orden: idx }));
      const result = await reorderEducationEntriesAction({
        colaboradorId,
        items,
      });
      if (!result.ok) {
        throw new Error(result.error || "Error al reordenar");
      }
      return orderedIds;
    },
    onSuccess: async () => {
      // No toast — reorder is a high-frequency UX gesture, just refresh.
      await queryClient.invalidateQueries({
        queryKey: educationEntriesQueryKey(colaboradorId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al reordenar");
    },
  });
}

export type { EducationEntryDto };