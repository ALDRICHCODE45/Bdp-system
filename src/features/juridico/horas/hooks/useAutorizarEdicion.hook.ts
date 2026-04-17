import { useMutation, useQueryClient } from "@tanstack/react-query";
import { autorizarEdicionAction } from "../server/actions/autorizarEdicionAction";
import { toast } from "sonner";

export const useAutorizarEdicion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (autorizacionId: string) => {
      const result = await autorizarEdicionAction({ autorizacionId });
      if (!result.ok)
        throw new Error(result.error || "Error al autorizar la solicitud");
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Solicitud autorizada exitosamente");
      await queryClient.invalidateQueries({ queryKey: ["registros-horas"] });
      await queryClient.invalidateQueries({
        queryKey: ["autorizaciones-pendientes"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al autorizar la solicitud");
    },
  });
};
