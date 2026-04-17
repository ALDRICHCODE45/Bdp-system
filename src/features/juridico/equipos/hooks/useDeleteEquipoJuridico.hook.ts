import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteEquipoJuridicoAction } from "../server/actions/deleteEquipoJuridicoAction";
import { toast } from "sonner";

export const useDeleteEquipoJuridico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteEquipoJuridicoAction(id);
      if (!result.ok) throw new Error(result.error || "Error al eliminar equipo jurídico");
      return result;
    },
    onSuccess: async () => {
      toast.success("Equipo jurídico eliminado exitosamente");
      await queryClient.invalidateQueries({ queryKey: ["equipos-juridicos"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar equipo jurídico");
    },
  });
};
