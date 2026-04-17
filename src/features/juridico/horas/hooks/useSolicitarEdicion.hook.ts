import { useMutation, useQueryClient } from "@tanstack/react-query";
import { solicitarEdicionAction } from "../server/actions/solicitarEdicionAction";
import { toast } from "sonner";

type SolicitarEdicionPayload = {
  registroHoraId: string;
  justificacion: string;
};

export const useSolicitarEdicion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SolicitarEdicionPayload) => {
      const result = await solicitarEdicionAction(data);
      if (!result.ok)
        throw new Error(result.error || "Error al solicitar edición");
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Solicitud de edición enviada exitosamente");
      await queryClient.invalidateQueries({ queryKey: ["registros-horas"] });
      await queryClient.invalidateQueries({
        queryKey: ["autorizaciones-pendientes"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al solicitar edición");
    },
  });
};
