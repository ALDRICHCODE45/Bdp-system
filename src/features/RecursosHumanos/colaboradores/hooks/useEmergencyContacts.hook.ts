"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createEmergencyContactAction,
  deleteEmergencyContactAction,
  listEmergencyContactsAction,
  updateEmergencyContactAction,
} from "../server/actions/emergencyContactActions";
import type { EmergencyContactDto } from "../server/dtos/EmergencyContactDto.dto";

/**
 * TanStack Query hooks for the EmergencyContact feature.
 *
 * Cache layout:
 * - `["emergency-contacts", colaboradorId]` — the list for one colaborador
 *
 * Mutations invalidate that key on success so the list immediately reflects
 * the change without a page reload (cap4 scenario: remove contact updates
 * the list).
 *
 * Permission gating (CC1/CC8):
 * - The server action calls `requireAnyPermission(['colaboradores:editar'])`
 *   first; the UI also wraps Add/Remove controls in a `<PermissionGuard>`
 *   so users without the permission never even see the controls.
 * - The list query only needs `colaboradores:acceder`, so we keep it
 *   enabled for any signed-in profile viewer.
 */

export const emergencyContactsQueryKey = (colaboradorId: string) =>
  ["emergency-contacts", colaboradorId] as const;

export function useEmergencyContacts(colaboradorId: string) {
  return useQuery<EmergencyContactDto[]>({
    queryKey: emergencyContactsQueryKey(colaboradorId),
    queryFn: async () => {
      const result = await listEmergencyContactsAction(colaboradorId);
      if (!result.ok) {
        throw new Error(result.error || "Error al cargar contactos");
      }
      return result.data;
    },
    enabled: Boolean(colaboradorId),
    staleTime: 30_000,
  });
}

export function useCreateEmergencyContact(colaboradorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      // Ensure the route-bound id is always present in the FormData
      // regardless of caller ergonomics.
      if (!formData.get("colaboradorId")) {
        formData.set("colaboradorId", colaboradorId);
      }
      const result = await createEmergencyContactAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al crear contacto");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Contacto de emergencia agregado");
      await queryClient.invalidateQueries({
        queryKey: emergencyContactsQueryKey(colaboradorId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear contacto");
    },
  });
}

export function useUpdateEmergencyContact(colaboradorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await updateEmergencyContactAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al actualizar contacto");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Contacto de emergencia actualizado");
      await queryClient.invalidateQueries({
        queryKey: emergencyContactsQueryKey(colaboradorId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar contacto");
    },
  });
}

export function useDeleteEmergencyContact(colaboradorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteEmergencyContactAction(id);
      if (!result.ok) {
        throw new Error(result.error || "Error al eliminar contacto");
      }
      return id;
    },
    onSuccess: async () => {
      toast.success("Contacto eliminado");
      await queryClient.invalidateQueries({
        queryKey: emergencyContactsQueryKey(colaboradorId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar contacto");
    },
  });
}
