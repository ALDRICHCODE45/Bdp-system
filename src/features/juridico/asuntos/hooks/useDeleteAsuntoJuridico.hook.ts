import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAsuntoJuridicoAction } from "../server/actions/deleteAsuntoJuridicoAction";
import { toast } from "sonner";

export const useDeleteAsuntoJuridico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteAsuntoJuridicoAction(id);
      if (!result.ok) throw new Error(result.error || "Error al cerrar asunto jurídico");
      return result;
    },
    onSuccess: async () => {
      toast.success("Asunto jurídico cerrado exitosamente");
      await queryClient.invalidateQueries({ queryKey: ["asuntos-juridicos"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al cerrar asunto jurídico");
    },
  });
};
