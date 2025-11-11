"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEntradasSalidasAction } from "../server/actions/updateEntradasSalidasActions.action";
import { showToast } from "@/core/shared/helpers/CustomToast";

export const useUpdateEntradaSalida = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await updateEntradasSalidasAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al actualizar la entrada o salida");
      }
      return result.data;
    },
    onSuccess: async () => {
      showToast({
        description: "Entrada/Salida actualizada correctamente",
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
        description: error.message || "La entrada/salida no pudo ser actualizada",
        title: "Ha Ocurrido un error",
        type: "error",
      });
    },
  });
};

