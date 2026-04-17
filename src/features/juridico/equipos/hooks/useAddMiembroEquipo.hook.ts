import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addMiembroEquipoAction } from "../server/actions/addMiembroEquipoAction";
import { toast } from "sonner";

export const useAddMiembroEquipo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { equipoId: string; usuarioId: string }) => {
      const result = await addMiembroEquipoAction(data);
      if (!result.ok) throw new Error(result.error || "Error al agregar miembro");
      return result;
    },
    onSuccess: async () => {
      toast.success("Miembro agregado exitosamente");
      await queryClient.invalidateQueries({ queryKey: ["equipos-juridicos"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al agregar miembro");
    },
  });
};
