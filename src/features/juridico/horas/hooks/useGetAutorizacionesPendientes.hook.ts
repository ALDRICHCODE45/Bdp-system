import { useQuery } from "@tanstack/react-query";
import { getAutorizacionesPendientesAction } from "../server/actions/getAutorizacionesPendientesAction";

export const useGetAutorizacionesPendientes = () => {
  return useQuery({
    queryKey: ["autorizaciones-pendientes"],
    queryFn: async () => {
      const result = await getAutorizacionesPendientesAction();
      if (!result.ok)
        throw new Error(
          result.error || "Error al obtener solicitudes pendientes"
        );
      return result.data;
    },
  });
};
