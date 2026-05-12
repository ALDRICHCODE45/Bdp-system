"use client";

import { useState } from "react";
import { DashboardFilters } from "./DashboardFilters";
import { DashboardKpiCards } from "./DashboardKpiCards";
import { DashboardHorasPorEquipoChart } from "./DashboardHorasPorEquipoChart";
import { DashboardHorasPorClienteChart } from "./DashboardHorasPorClienteChart";
import { DashboardHorasPorUsuarioChart } from "./DashboardHorasPorUsuarioChart";
import { DashboardTendenciaSemanalChart } from "./DashboardTendenciaSemanalChart";
import { DashboardHorasPorAsuntoTable } from "./DashboardHorasPorAsuntoTable";
import { useGetDashboardHoras } from "../../hooks/useGetDashboardHoras.hook";
import type { DashboardHorasFilters } from "../../server/dtos/DashboardHorasDto.dto";

export function DashboardHorasView() {
  const [filters, setFilters] = useState<DashboardHorasFilters>({
    ano: new Date().getFullYear(),
  });
  const { data, isPending, isFetching } = useGetDashboardHoras(filters);

  const hasData = (data?.totalRegistros ?? 0) > 0;

  return (
    <div className="space-y-6">
      <DashboardFilters filters={filters} onChange={setFilters} />

      <DashboardKpiCards
        isLoading={isPending}
        totalHoras={data?.totalHoras ?? 0}
        totalRegistros={data?.totalRegistros ?? 0}
        totalUsuarios={data?.totalUsuarios ?? 0}
        totalClientes={data?.totalClientes ?? 0}
      />

      {!isPending && !hasData ? (
        <div className="rounded-xl border bg-card shadow-sm p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No encontramos datos para esos filtros. Probá ampliando el rango semanal o cambiando el año.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <DashboardHorasPorEquipoChart
              data={data?.horasPorEquipo ?? []}
              isLoading={isPending || isFetching}
            />
            <DashboardHorasPorClienteChart
              data={data?.horasPorCliente ?? []}
              isLoading={isPending || isFetching}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            <DashboardHorasPorUsuarioChart
              data={data?.horasPorUsuario ?? []}
              isLoading={isPending || isFetching}
            />
            <DashboardTendenciaSemanalChart
              data={data?.horasPorSemana ?? []}
              isLoading={isPending || isFetching}
            />
          </div>

          <DashboardHorasPorAsuntoTable
            data={data?.horasPorAsunto ?? []}
            isLoading={isPending || isFetching}
          />
        </>
      )}
    </div>
  );
}
