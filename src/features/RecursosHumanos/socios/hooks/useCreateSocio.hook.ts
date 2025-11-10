import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSocioAction } from "../server/actions/createSocioAction";
import { toast } from "sonner";

export const useCreateSocio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await createSocioAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al crear socio");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Socio creado exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["socios"],
      });
      await queryClient.refetchQueries({
        queryKey: ["socios"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear socio");
    },
  });
};

