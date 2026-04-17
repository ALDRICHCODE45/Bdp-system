import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rechazarEdicionAction } from "../server/actions/rechazarEdicionAction";
import { toast } from "sonner";

type RechazarEdicionPayload = {
  autorizacionId: string;
  motivoRechazo: string;
};

export const useRechazarEdicion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RechazarEdicionPayload) => {
      const result = await rechazarEdicionAction(data);
      if (!result.ok)
        throw new Error(result.error || "Error al rechazar la solicitud");
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Solicitud rechazada");
      await queryClient.invalidateQueries({ queryKey: ["registros-horas"] });
      await queryClient.invalidateQueries({
        queryKey: ["autorizaciones-pendientes"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al rechazar la solicitud");
    },
  });
};
