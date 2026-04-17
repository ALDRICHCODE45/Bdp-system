import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRegistroHoraAction } from "../server/actions/createRegistroHoraAction";
import { toast } from "sonner";
import type { CreateRegistroHoraFormValues } from "../schemas/createRegistroHoraSchema";

export const useCreateRegistroHora = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRegistroHoraFormValues) => {
      const result = await createRegistroHoraAction(data);
      if (!result.ok)
        throw new Error(result.error || "Error al registrar horas");
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Horas registradas exitosamente");
      await queryClient.invalidateQueries({ queryKey: ["registros-horas"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al registrar horas");
    },
  });
};
