import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRegistroHoraAction } from "../server/actions/deleteRegistroHoraAction";
import { toast } from "sonner";

export const useDeleteRegistroHora = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteRegistroHoraAction(id);
      if (!result.ok)
        throw new Error(result.error || "Error al eliminar registro de horas");
      return result;
    },
    onSuccess: async () => {
      toast.success("Registro de horas eliminado exitosamente");
      await queryClient.invalidateQueries({ queryKey: ["registros-horas"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar registro de horas");
    },
  });
};
