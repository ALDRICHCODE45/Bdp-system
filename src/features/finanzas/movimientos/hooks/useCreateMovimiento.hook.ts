import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { z } from "zod";
import { createMovimientoAction } from "../server/actions/createMovimientoAction";
import { createMovimientoValidator } from "../server/validators/createMovimientoValidator";

type CreateMovimientoActionInput = z.input<typeof createMovimientoValidator>;

export const useCreateMovimiento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMovimientoActionInput) => {
      const result = await createMovimientoAction(input);
      if (!result.ok) {
        throw new Error(result.error || "Error al crear movimiento");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Movimiento creado exitosamente");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["movimientos"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["movimientos", "titulares"],
        }),
      ]);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear movimiento");
    },
  });
};
