import { useQuery } from "@tanstack/react-query";
import { getDashboardHorasAction } from "../server/actions/getDashboardHorasAction";
import type { DashboardHorasFilters } from "../server/dtos/DashboardHorasDto.dto";

export const useGetDashboardHoras = (filters: DashboardHorasFilters) => {
  return useQuery({
    queryKey: ["dashboard-horas", filters],
    queryFn: async () => {
      const result = await getDashboardHorasAction(filters);
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
  });
};
