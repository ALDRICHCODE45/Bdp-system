import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTarifaAction } from "../server/actions/createTarifaAction";
import { toast } from "sonner";

export type CreateTarifaInput = {
  usuarioId: string;
  asuntoJuridicoId: string;
  tarifaHora: number;
  motivo?: string | null;
};

export const useCreateTarifa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTarifaInput) => {
      const result = await createTarifaAction(data);
      if (!result.ok)
        throw new Error(result.error || "Error al crear la tarifa");
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Tarifa creada exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["tarifas-abogado-asunto"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear la tarifa");
    },
  });
};
