import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMovimientoAction } from "../server/actions/deleteMovimientoAction";
import { toast } from "sonner";

export const useDeleteMovimiento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteMovimientoAction({ id });
      if (!result.ok) {
        throw new Error(result.error || "Error al eliminar movimiento");
      }
      return result;
    },
    onSuccess: async () => {
      toast.success("Movimiento eliminado exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["movimientos"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar movimiento");
    },
  });
};
