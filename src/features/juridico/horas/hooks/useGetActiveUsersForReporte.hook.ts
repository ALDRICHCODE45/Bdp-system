import { useQuery } from "@tanstack/react-query";
import { getActiveUsersForReporteAction } from "../server/actions/getActiveUsersForReporteAction";

export const useGetActiveUsersForReporte = (enabled = true) => {
  return useQuery({
    queryKey: ["active-users-reporte-horas"],
    enabled,
    queryFn: async () => {
      const result = await getActiveUsersForReporteAction();
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
  });
};
