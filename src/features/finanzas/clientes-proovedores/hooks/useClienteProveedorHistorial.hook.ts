import { useQuery } from "@tanstack/react-query";
import { getClienteProveedorHistorialAction } from "../server/actions/getClienteProveedorHistorialAction";
import { ClienteProveedorHistorialDto } from "../server/dtos/ClienteProveedorHistorialDto.dto";

export const useClienteProveedorHistorial = (
  clienteProveedorId: string,
  enabled: boolean = true
) => {
  return useQuery<ClienteProveedorHistorialDto[]>({
    queryKey: ["cliente-proveedor-historial", clienteProveedorId],
    queryFn: async () => {
      const result = await getClienteProveedorHistorialAction(clienteProveedorId);
      if (!result.ok || !result.data) {
        throw new Error(result.error || "Error al cargar historial");
      }
      return result.data;
    },
    enabled: enabled && !!clienteProveedorId,
  });
};

