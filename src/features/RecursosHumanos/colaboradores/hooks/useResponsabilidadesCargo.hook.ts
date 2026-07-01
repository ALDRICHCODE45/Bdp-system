"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createResponsabilidadCargoAction,
  deleteResponsabilidadCargoAction,
  listResponsabilidadesCargoAction,
  toggleResponsabilidadCargoAction,
  updateResponsabilidadCargoAction,
} from "../server/actions/responsabilidadCargoActions";
import type { ResponsabilidadCargoDto } from "../server/dtos/ResponsabilidadCargoDto.dto";

/**
 * TanStack Query hooks for the ResponsabilidadCargo feature (cap5 checklist).
 *
 * Cache layout:
 * - `["responsabilidades-cargo", colaboradorId]` — the checklist for one
 *   colaborador.
 *
 * Every mutation invalidates that key on success so toggling / editing /
 * adding / removing a row refreshes the visible list without a page reload
 * (cap5 scenario).
 */

export const responsabilidadesCargoQueryKey = (colaboradorId: string) =>
  ["responsabilidades-cargo", colaboradorId] as const;

export function useResponsabilidadesCargo(colaboradorId: string) {
  return useQuery<ResponsabilidadCargoDto[]>({
    queryKey: responsabilidadesCargoQueryKey(colaboradorId),
    queryFn: async () => {
      const result = await listResponsabilidadesCargoAction(colaboradorId);
      if (!result.ok) {
        throw new Error(result.error || "Error al cargar responsabilidades");
      }
      return result.data;
    },
    enabled: Boolean(colaboradorId),
    staleTime: 30_000,
  });
}

export function useCreateResponsabilidadCargo(colaboradorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      if (!formData.get("colaboradorId")) {
        formData.set("colaboradorId", colaboradorId);
      }
      const result = await createResponsabilidadCargoAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al crear responsabilidad");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Responsabilidad agregada");
      await queryClient.invalidateQueries({
        queryKey: responsabilidadesCargoQueryKey(colaboradorId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear responsabilidad");
    },
  });
}

export function useUpdateResponsabilidadCargo(colaboradorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await updateResponsabilidadCargoAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al actualizar responsabilidad");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Responsabilidad actualizada");
      await queryClient.invalidateQueries({
        queryKey: responsabilidadesCargoQueryKey(colaboradorId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar responsabilidad");
    },
  });
}

export function useToggleResponsabilidadCargo(colaboradorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; completada: boolean }) => {
      const result = await toggleResponsabilidadCargoAction(input);
      if (!result.ok) {
        throw new Error(
          result.error || "Error al cambiar el estado de la responsabilidad"
        );
      }
      return result.data;
    },
    onSuccess: async () => {
      // No toast on toggle — high-frequency UX, just refresh the list.
      await queryClient.invalidateQueries({
        queryKey: responsabilidadesCargoQueryKey(colaboradorId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al cambiar el estado");
    },
  });
}

export function useDeleteResponsabilidadCargo(colaboradorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteResponsabilidadCargoAction(id);
      if (!result.ok) {
        throw new Error(
          result.error || "Error al eliminar responsabilidad"
        );
      }
      return id;
    },
    onSuccess: async () => {
      toast.success("Responsabilidad eliminada");
      await queryClient.invalidateQueries({
        queryKey: responsabilidadesCargoQueryKey(colaboradorId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar responsabilidad");
    },
  });
}
