"use client";

import { useQuery } from "@tanstack/react-query";
import { getFacturasDashboardAction } from "../server/actions/getFacturasDashboardAction";
import type {
  DashboardPeriod,
  FacturasDashboardDto,
} from "../server/dtos/FacturasDashboardDto.dto";

export const useFacturasDashboard = (
  period: DashboardPeriod,
  enabled: boolean = true
) => {
  return useQuery<FacturasDashboardDto>({
    queryKey: ["facturas-dashboard", period],
    queryFn: async () => {
      const result = await getFacturasDashboardAction(period);
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
