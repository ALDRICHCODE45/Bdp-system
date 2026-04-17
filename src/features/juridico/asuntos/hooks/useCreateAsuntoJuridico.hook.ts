import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAsuntoJuridicoAction } from "../server/actions/createAsuntoJuridicoAction";
import { toast } from "sonner";
import type { CreateAsuntoJuridicoFormValues } from "../schemas/createAsuntoJuridicoSchema";

export const useCreateAsuntoJuridico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAsuntoJuridicoFormValues) => {
      const result = await createAsuntoJuridicoAction(data);
      if (!result.ok) throw new Error(result.error || "Error al crear asunto jurídico");
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Asunto jurídico creado exitosamente");
      await queryClient.invalidateQueries({ queryKey: ["asuntos-juridicos"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear asunto jurídico");
    },
  });
};
