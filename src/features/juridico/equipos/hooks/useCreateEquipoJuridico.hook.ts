import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEquipoJuridicoAction } from "../server/actions/createEquipoJuridicoAction";
import { toast } from "sonner";
import type { CreateEquipoJuridicoFormValues } from "../schemas/createEquipoJuridicoSchema";

export const useCreateEquipoJuridico = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEquipoJuridicoFormValues) => {
      const result = await createEquipoJuridicoAction(data);
      if (!result.ok) throw new Error(result.error || "Error al crear equipo jurídico");
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Equipo jurídico creado exitosamente");
      await queryClient.invalidateQueries({ queryKey: ["equipos-juridicos"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear equipo jurídico");
    },
  });
};
