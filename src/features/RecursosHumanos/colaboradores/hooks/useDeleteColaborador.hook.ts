import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteColaboradorAction } from "../server/actions/deleteColaboradorAction";
import { toast } from "sonner";

export const useDeleteColaborador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteColaboradorAction(id);
      if (!result.ok) {
        throw new Error(result.error || "Error al eliminar colaborador");
      }
    },
    onSuccess: async () => {
      toast.success("Colaborador eliminado exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["colaboradores"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar colaborador");
    },
  });
};

