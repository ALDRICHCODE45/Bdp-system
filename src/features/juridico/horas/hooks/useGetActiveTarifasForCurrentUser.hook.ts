import { useQuery } from "@tanstack/react-query";
import { getActiveTarifasForCurrentUserAction } from "../server/actions/getActiveTarifasForCurrentUserAction";

/**
 * Hook para que el sheet de horas sepa qué asuntos tienen tarifa
 * activa para el session user (o todos, si admin/socio). El sheet usa
 * este set para greyar opciones de asunto sin tarifa y mostrar el
 * tooltip con el mensaje exacto de bloqueo.
 */
export const useGetActiveTarifasForCurrentUser = () => {
  return useQuery({
    queryKey: ["active-tarifas-current-user"],
    queryFn: async () => {
      const result = await getActiveTarifasForCurrentUserAction();
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
    staleTime: 30_000,
  });
};
