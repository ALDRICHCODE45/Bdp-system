"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUserAction } from "../server/actions/deleteUserAction";

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await deleteUserAction(userId);
      if (!result.ok) {
        throw new Error(result.error || "Error al eliminar usuario");
      }
      return result;
    },
    onSuccess: async (_, userId) => {
      // Invalidar la query del usuario individual
      await queryClient.invalidateQueries({
        queryKey: ["user", userId],
      });

      // Invalidar posibles queries de lista de usuarios si existen
      await queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
};

