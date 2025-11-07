"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRoleAction } from "../server/actions/deleteRoleAction";

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: string) => {
      const result = await deleteRoleAction(roleId);
      if (!result.ok) {
        throw new Error(result.error || "Error al eliminar rol");
      }
      return result;
    },
    onSuccess: async (_, roleId) => {
      // Invalidar la query del rol individual
      await queryClient.invalidateQueries({
        queryKey: ["role", roleId],
      });

      // Invalidar y refetchear queries de lista de roles para asegurar datos actualizados
      await queryClient.invalidateQueries({
        queryKey: ["roles"],
      });
      
      // Forzar refetch inmediato de la query de roles para actualizar componentes activos
      await queryClient.refetchQueries({
        queryKey: ["roles"],
      });
    },
  });
};

