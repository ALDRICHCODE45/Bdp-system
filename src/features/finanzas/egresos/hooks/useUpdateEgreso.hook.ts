import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEgresoAction } from "../server/actions/updateEgresoAction";
import { toast } from "sonner";

export const useUpdateEgreso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await updateEgresoAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al actualizar egreso");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Egreso actualizado exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["egresos"],
      });
      await queryClient.refetchQueries({
        queryKey: ["egresos"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar egreso");
    },
  });
};

