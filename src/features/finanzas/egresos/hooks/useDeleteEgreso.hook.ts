import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteEgresoAction } from "../server/actions/deleteEgresoAction";
import { toast } from "sonner";

export const useDeleteEgreso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteEgresoAction(id);
      if (!result.ok) {
        throw new Error(result.error || "Error al eliminar egreso");
      }
      return result;
    },
    onSuccess: async () => {
      toast.success("Egreso eliminado exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["egresos"],
      });
      await queryClient.refetchQueries({
        queryKey: ["egresos"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar egreso");
    },
  });
};

