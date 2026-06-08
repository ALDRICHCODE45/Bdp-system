import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateMovimientoAction } from "../server/actions/updateMovimientoAction";
import { toast } from "sonner";

export const useUpdateMovimiento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: unknown) => {
      const result = await updateMovimientoAction(input);
      if (!result.ok) {
        throw new Error(result.error || "Error al actualizar movimiento");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Movimiento actualizado exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["movimientos"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar movimiento");
    },
  });
};
