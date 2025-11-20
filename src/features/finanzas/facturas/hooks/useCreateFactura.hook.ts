import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFacturaAction } from "../server/actions/createFacturaAction";
import { toast } from "sonner";

export const useCreateFactura = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await createFacturaAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al crear factura");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Factura creada exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["facturas"],
      });
      await queryClient.refetchQueries({
        queryKey: ["facturas"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear factura");
    },
  });
};

