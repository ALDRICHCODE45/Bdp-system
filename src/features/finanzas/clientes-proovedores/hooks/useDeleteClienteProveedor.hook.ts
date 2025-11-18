import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteClienteProveedorAction } from "../server/actions/deleteClienteProveedorAction";
import { toast } from "sonner";

export const useDeleteClienteProveedor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteClienteProveedorAction(id);
      if (!result.ok) {
        throw new Error(result.error || "Error al eliminar cliente/proveedor");
      }
    },
    onSuccess: async () => {
      toast.success("Cliente/Proveedor eliminado exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["clientesProveedores"],
      });
      await queryClient.refetchQueries({
        queryKey: ["clientesProveedores"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar cliente/proveedor");
    },
  });
};

