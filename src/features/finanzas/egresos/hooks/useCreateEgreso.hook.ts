import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEgresoAction } from "../server/actions/createEgresoAction";
import { toast } from "sonner";

export const useCreateEgreso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await createEgresoAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al crear egreso");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Egreso creado exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["egresos"],
      });
      await queryClient.refetchQueries({
        queryKey: ["egresos"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear egreso");
    },
  });
};

