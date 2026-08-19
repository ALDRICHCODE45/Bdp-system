import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTarifaAction } from "../server/actions/updateTarifaAction";
import { toast } from "sonner";

export type UpdateTarifaInput = {
  id: string;
  tarifaHora: number;
  motivo?: string | null;
};

export const useUpdateTarifa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTarifaInput) => {
      const result = await updateTarifaAction(data);
      if (!result.ok)
        throw new Error(result.error || "Error al actualizar la tarifa");
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Tarifa actualizada");
      await queryClient.invalidateQueries({
        queryKey: ["tarifas-abogado-asunto"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar la tarifa");
    },
  });
};
