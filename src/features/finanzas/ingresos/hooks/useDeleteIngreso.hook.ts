import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteIngresoAction } from "../server/actions/deleteIngresoAction";
import { toast } from "sonner";

export const useDeleteIngreso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteIngresoAction(id);
      if (!result.ok) {
        throw new Error(result.error || "Error al eliminar ingreso");
      }
      return result;
    },
    onSuccess: async () => {
      toast.success("Ingreso eliminado exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["ingresos"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar ingreso");
    },
  });
};

