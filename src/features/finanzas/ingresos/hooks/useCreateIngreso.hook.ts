import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIngresoAction } from "../server/actions/createIngresoAction";
import { toast } from "sonner";

export const useCreateIngreso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await createIngresoAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al crear ingreso");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Ingreso creado exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["ingresos"],
      });
      await queryClient.refetchQueries({
        queryKey: ["ingresos"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear ingreso");
    },
  });
};

