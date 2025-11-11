"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEntradasSalidasAction } from "../server/actions/createEntradasSalidasActions.action";
import { showToast } from "@/core/shared/helpers/CustomToast";

export const useCreateEntradaSalida = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await createEntradasSalidasAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al crear la entrada o salida");
      }
      return result.data;
    },
    onSuccess: async () => {
      showToast({
        description: "Entrada/Salida creada correctamente",
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
        description: error.message || "La entrada/salida no pudo ser creada",
        title: "Ha Ocurrido un error",
        type: "error",
      });
    },
  });
};

