import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateColaboradorAction } from "../server/actions/updateColaboradorAction";
import { toast } from "sonner";

export const useEditColaborador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await updateColaboradorAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al actualizar colaborador");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Colaborador actualizado exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["colaboradores"],
      });
      await queryClient.refetchQueries({
        queryKey: ["colaboradores"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar colaborador");
    },
  });
};

