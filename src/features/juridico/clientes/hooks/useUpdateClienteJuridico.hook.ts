import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClienteJuridicoAction } from "../server/actions/updateClienteJuridicoAction";
import { toast } from "sonner";
import type { UpdateClienteJuridicoFormValues } from "../schemas/updateClienteJuridicoSchema";

export const useUpdateClienteJuridico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateClienteJuridicoFormValues) => {
      const result = await updateClienteJuridicoAction(data);
      if (!result.ok) throw new Error(result.error || "Error al actualizar cliente jurídico");
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Cliente jurídico actualizado exitosamente");
      await queryClient.invalidateQueries({ queryKey: ["clientes-juridicos"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar cliente jurídico");
    },
  });
};
