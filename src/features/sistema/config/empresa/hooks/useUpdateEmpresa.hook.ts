"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEmpresaAction } from "../server/actions/updateEmpresaAction";
import { toast } from "sonner";

export const useUpdateEmpresa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await updateEmpresaAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al actualizar empresa");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Empresa actualizada exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["empresa"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar empresa");
    },
  });
};

