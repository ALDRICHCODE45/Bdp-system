"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/core/shared/components/DataTable/DataTable";
import type { TableConfig } from "@/core/shared/components/DataTable/types";
import type { DashboardHorasPorAsuntoDto } from "../../server/dtos/DashboardHorasDto.dto";
import { formatHoras } from "../../helpers/formatHoras";

const columns: ColumnDef<DashboardHorasPorAsuntoDto>[] = [
  {
    header: "Asunto",
    accessorKey: "nombre",
    size: 32,
  },
  {
    header: "Cliente",
    accessorKey: "clienteNombre",
    size: 28,
  },
  {
    header: "Horas",
    accessorKey: "horas",
    cell: ({ row }) => <span className="font-mono">{formatHoras(row.original.horas)}</span>,
    size: 16,
  },
  {
    header: "Registros",
    accessorKey: "registros",
    cell: ({ row }) => <span className="font-mono">{row.original.registros.toLocaleString()}</span>,
    size: 16,
  },
];

const tableConfig: TableConfig<DashboardHorasPorAsuntoDto> = {
  filters: {
    searchColumn: "nombre",
    searchPlaceholder: "Buscar por asunto...",
    showSearch: true,
  },
  actions: {
    showAddButton: false,
  },
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50],
    showPageSizeSelector: true,
    showPaginationInfo: true,
  },
  emptyStateMessage: "No hay asuntos para los filtros seleccionados.",
  enableSorting: true,
  enableColumnVisibility: true,
  enableRowSelection: false,
};

export function DashboardHorasPorAsuntoTable({
  data,
  isLoading,
}: {
  data: DashboardHorasPorAsuntoDto[];
  isLoading: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">Horas por Asunto</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Detalle de horas por asunto jurídico</p>
      </div>
      <DataTable columns={columns} data={data} config={tableConfig} isLoading={isLoading} />
    </div>
  );
}
