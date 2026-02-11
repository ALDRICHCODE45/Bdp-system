import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSocioAction } from "../server/actions/updateSocioAction";
import { toast } from "sonner";

export const useEditSocio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await updateSocioAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al actualizar socio");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Socio actualizado exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["socios"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar socio");
    },
  });
};

