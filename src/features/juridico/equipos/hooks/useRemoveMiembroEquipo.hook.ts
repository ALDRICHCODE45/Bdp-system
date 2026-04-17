import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeMiembroEquipoAction } from "../server/actions/removeMiembroEquipoAction";
import { toast } from "sonner";

export const useRemoveMiembroEquipo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { equipoId: string; usuarioId: string }) => {
      const result = await removeMiembroEquipoAction(data);
      if (!result.ok) throw new Error(result.error || "Error al remover miembro");
      return result;
    },
    onSuccess: async () => {
      toast.success("Miembro removido exitosamente");
      await queryClient.invalidateQueries({ queryKey: ["equipos-juridicos"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al remover miembro");
    },
  });
};
