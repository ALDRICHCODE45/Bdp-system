import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAsuntoJuridicoAction } from "../server/actions/updateAsuntoJuridicoAction";
import { toast } from "sonner";
import type { UpdateAsuntoJuridicoFormValues } from "../schemas/updateAsuntoJuridicoSchema";

export const useUpdateAsuntoJuridico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAsuntoJuridicoFormValues) => {
      const result = await updateAsuntoJuridicoAction(data);
      if (!result.ok) throw new Error(result.error || "Error al actualizar asunto jurídico");
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Asunto jurídico actualizado exitosamente");
      await queryClient.invalidateQueries({ queryKey: ["asuntos-juridicos"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar asunto jurídico");
    },
  });
};
