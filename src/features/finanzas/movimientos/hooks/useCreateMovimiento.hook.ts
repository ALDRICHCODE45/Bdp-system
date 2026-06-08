import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMovimientoAction } from "../server/actions/createMovimientoAction";
import { toast } from "sonner";

export const useCreateMovimiento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: unknown) => {
      const result = await createMovimientoAction(input);
      if (!result.ok) {
        throw new Error(result.error || "Error al crear movimiento");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Movimiento creado exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["movimientos"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear movimiento");
    },
  });
};
