import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEquipoJuridicoAction } from "../server/actions/updateEquipoJuridicoAction";
import { toast } from "sonner";
import type { UpdateEquipoJuridicoFormValues } from "../schemas/updateEquipoJuridicoSchema";

export const useUpdateEquipoJuridico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateEquipoJuridicoFormValues) => {
      const result = await updateEquipoJuridicoAction(data);
      if (!result.ok) throw new Error(result.error || "Error al actualizar equipo jurídico");
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Equipo jurídico actualizado exitosamente");
      await queryClient.invalidateQueries({ queryKey: ["equipos-juridicos"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar equipo jurídico");
    },
  });
};
