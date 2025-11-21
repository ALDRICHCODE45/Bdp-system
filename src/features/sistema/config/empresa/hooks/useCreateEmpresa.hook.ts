"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEmpresaAction } from "../server/actions/createEmpresaAction";
import { toast } from "sonner";

export const useCreateEmpresa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await createEmpresaAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al crear empresa");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Empresa creada exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["empresa"],
      });
      await queryClient.refetchQueries({
        queryKey: ["empresa"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear empresa");
    },
  });
};

