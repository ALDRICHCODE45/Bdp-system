"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registrarSalidaAction } from "../server/actions/registrarSalidaActions.action";
import { showToast } from "@/core/shared/helpers/CustomToast";

export const useRegistrarSalida = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await registrarSalidaAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al registrar la salida");
      }
      return result.data;
    },
    onSuccess: async () => {
      showToast({
        description: "Salida registrada correctamente",
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
        description: error.message || "La salida no pudo ser registrada",
        title: "Ha Ocurrido un error",
        type: "error",
      });
    },
  });
};

