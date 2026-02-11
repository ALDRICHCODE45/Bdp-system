import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateFacturaAction } from "../server/actions/updateFacturaAction";
import { toast } from "sonner";

export const useUpdateFactura = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await updateFacturaAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al actualizar factura");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Factura actualizada exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["facturas"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar factura");
    },
  });
};

