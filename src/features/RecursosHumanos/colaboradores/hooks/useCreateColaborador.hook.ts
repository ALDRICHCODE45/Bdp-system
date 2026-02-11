"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createColaboradorAction } from "../server/actions/createColaboradorAction";
import { showToast } from "@/core/shared/helpers/CustomToast";

export const useCreateColaborador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await createColaboradorAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al crear colaborador");
      }
      return result.data;
    },
    onSuccess: async () => {
      showToast({
        description: "Colaborador creado correctamente",
        title: "Operacion Exitosa",
        type: "success",
      });
      await queryClient.invalidateQueries({
        queryKey: ["colaboradores"],
      });
    },
    onError: (error: Error) => {
      showToast({
        description: "El colaborador no pudo ser creado",
        title: "Ha Ocurrido un error",
        type: "error",
      });
    },
  });
};
