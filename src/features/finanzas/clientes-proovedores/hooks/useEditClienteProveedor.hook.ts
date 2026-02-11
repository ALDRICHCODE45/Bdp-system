import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateClienteProveedorAction } from "../server/actions/updateClienteProveedorAction";
import { toast } from "sonner";

export const useEditClienteProveedor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await updateClienteProveedorAction(formData);
      if (!result.ok) {
        throw new Error(
          result.error || "Error al actualizar cliente/proveedor"
        );
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Cliente/Proveedor actualizado exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["clientesProveedores"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar cliente/proveedor");
    },
  });
};

