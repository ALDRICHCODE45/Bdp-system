import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRegistroHoraAction } from "../server/actions/updateRegistroHoraAction";
import { toast } from "sonner";
import type { UpdateRegistroHoraFormValues } from "../schemas/updateRegistroHoraSchema";

export const useUpdateRegistroHora = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateRegistroHoraFormValues) => {
      const result = await updateRegistroHoraAction(data);
      if (!result.ok)
        throw new Error(result.error || "Error al actualizar registro de horas");
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Registro de horas actualizado exitosamente");
      await queryClient.invalidateQueries({ queryKey: ["registros-horas"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar registro de horas");
    },
  });
};
