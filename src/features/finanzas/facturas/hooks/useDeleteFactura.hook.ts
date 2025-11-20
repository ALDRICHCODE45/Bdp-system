import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFacturaAction } from "../server/actions/deleteFacturaAction";
import { toast } from "sonner";

export const useDeleteFactura = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteFacturaAction(id);
      if (!result.ok) {
        throw new Error(result.error || "Error al eliminar factura");
      }
      return result;
    },
    onSuccess: async () => {
      toast.success("Factura eliminada exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["facturas"],
      });
      await queryClient.refetchQueries({
        queryKey: ["facturas"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar factura");
    },
  });
};

