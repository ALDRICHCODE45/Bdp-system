import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClienteProveedorAction } from "../server/actions/createClienteProveedorAction";
import { toast } from "sonner";

export const useCreateClienteProveedor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await createClienteProveedorAction(formData);
      if (!result.ok) {
        throw new Error(result.error || "Error al crear cliente/proveedor");
      }
      return result.data;
    },
    onSuccess: async () => {
      toast.success("Cliente/Proveedor creado exitosamente");
      await queryClient.invalidateQueries({
        queryKey: ["clientesProveedores"],
      });
      await queryClient.refetchQueries({
        queryKey: ["clientesProveedores"],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear cliente/proveedor");
    },
  });
};

