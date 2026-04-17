import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClienteJuridicoAction } from "../server/actions/createClienteJuridicoAction";
import { toast } from "sonner";
import type { CreateClienteJuridicoFormValues } from "../schemas/createClienteJuridicoSchema";

export const useCreateClienteJuridico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateClienteJuridicoFormValues) => {
      const result = await createClienteJuridicoAction(data);
      if (!result.ok) throw new Error(result.error || "Error al crear cliente jurídico");
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Cliente jurídico creado exitosamente");
      await queryClient.invalidateQueries({ queryKey: ["clientes-juridicos"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear cliente jurídico");
    },
  });
};
