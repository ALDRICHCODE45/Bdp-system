"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteEntradasSalidasAction } from "../server/actions/deleteEntradasSalidasActions.action";
import { showToast } from "@/core/shared/helpers/CustomToast";

export const useDeleteEntradaSalida = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteEntradasSalidasAction(id);
      if (!result.ok) {
        throw new Error(result.error || "Error al eliminar la entrada o salida");
      }
    },
    onSuccess: async () => {
      showToast({
        description: "Entrada/Salida eliminada correctamente",
        title: "Operación Exitosa",
        type: "success",
      });
      await queryClient.invalidateQueries({
        queryKey: ["entradas-salidas"],
      });
      await queryClient.refetchQueries({
        queryKey: ["entradas-salidas"],
      });
    },
    onError: (error: Error) => {
      showToast({
        description: error.message || "La entrada/salida no pudo ser eliminada",
        title: "Ha Ocurrido un error",
        type: "error",
      });
    },
  });
};

