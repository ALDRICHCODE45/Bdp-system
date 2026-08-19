import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deactivateTarifaAction } from "../server/actions/deactivateTarifaAction";
import { toast } from "sonner";

export const useDeactivateTarifa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deactivateTarifaAction({ id });
      if (!result.ok)
        throw new Error(result.error || "Error al desactivar la tarifa");
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Tarifa desactivada");
      await queryClient.invalidateQueries({
        queryKey: ["tarifas-abogado-asunto"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al desactivar la tarifa");
    },
  });
};
