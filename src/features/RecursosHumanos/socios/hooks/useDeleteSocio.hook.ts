import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSocioAction } from "../server/actions/deleteSocioAction";
import { toast } from "sonner";

export const useDeleteSocio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteSocioAction(id);
      if (!result.ok) {
        throw new Error(result.error || "Error al eliminar socio");
      }
    },
    onSuccess: async () => {
      toast.success("Socio eliminado exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["socios"],
      });
      // También invalidar colaboradores por si tenían este socio asignado
      await queryClient.invalidateQueries({
        queryKey: ["colaboradores"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar socio");
    },
  });
};

