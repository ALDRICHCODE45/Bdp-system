import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateIngresoAction } from "../server/actions/updateIngresoAction";
import { toast } from "sonner";

export const useUpdateIngreso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await updateIngresoAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al actualizar ingreso");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Ingreso actualizado exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["ingresos"],
      });
      await queryClient.refetchQueries({
        queryKey: ["ingresos"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar ingreso");
    },
  });
};

