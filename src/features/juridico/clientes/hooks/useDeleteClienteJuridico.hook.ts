import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteClienteJuridicoAction } from "../server/actions/deleteClienteJuridicoAction";
import { toast } from "sonner";

export const useDeleteClienteJuridico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteClienteJuridicoAction(id);
      if (!result.ok) throw new Error(result.error || "Error al eliminar cliente jurídico");
      return result;
    },
    onSuccess: async () => {
      toast.success("Cliente jurídico eliminado exitosamente");
      await queryClient.invalidateQueries({ queryKey: ["clientes-juridicos"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar cliente jurídico");
    },
  });
};
