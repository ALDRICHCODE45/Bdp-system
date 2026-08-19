"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/core/shared/ui/badge";
import type { ReporteGrupoDto } from "../server/dtos/ReporteHorasAgrupadoDto.dto";
import { formatHoras } from "../helpers/formatHoras";

const ESTADO_LABELS: Record<string, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  CERRADO: "Cerrado",
};

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatPeriodo(ano: number, semana: number): string {
  return `Sem ${semana} · ${ano}`;
}

export const createReporteHorasAgrupadoColumns =
  (): ColumnDef<ReporteGrupoDto>[] => [
    {
      id: "periodo",
      header: "Periodo",
      accessorFn: (row) => `${row.ano}-${row.semana}`,
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="font-mono text-xs whitespace-nowrap"
        >
          {formatPeriodo(row.original.ano, row.original.semana)}
        </Badge>
      ),
      size: 14,
    },
    {
      id: "usuarioNombre",
      header: "Abogado",
      accessorFn: (row) => row.usuarioNombre,
      cell: ({ row }) => (
        <div className="text-sm font-medium truncate max-w-[160px]">
          {row.original.usuarioNombre}
        </div>
      ),
      size: 18,
    },
    {
      id: "clienteNombre",
      header: "Cliente",
      accessorFn: (row) => row.clienteNombre,
      cell: ({ row }) => (
        <div className="text-sm truncate max-w-[140px]">
          {row.original.clienteNombre}
        </div>
      ),
      size: 16,
    },
    {
      id: "asuntoNombre",
      header: "Asunto",
      accessorFn: (row) => row.asuntoNombre,
      cell: ({ row }) => (
        <div className="text-sm truncate max-w-[180px]">
          {row.original.asuntoNombre}
        </div>
      ),
      size: 20,
    },
    {
      id: "equipoNombre",
      header: "Equipo",
      accessorFn: (row) => row.equipoNombre,
      cell: ({ row }) => (
        <div className="text-sm truncate max-w-[120px]">
          {row.original.equipoNombre}
        </div>
      ),
      size: 14,
    },
    {
      id: "socioNombre",
      header: "Socio",
      accessorFn: (row) => row.socioNombre,
      cell: ({ row }) => (
        <div className="text-sm truncate max-w-[120px]">
          {row.original.socioNombre}
        </div>
      ),
      size: 14,
    },
    {
      id: "estadoAsunto",
      header: "Estado",
      accessorFn: (row) => row.estadoAsunto,
      cell: ({ row }) => {
        const estado = row.original.estadoAsunto;
        const label = ESTADO_LABELS[estado] ?? estado;
        const variant =
          estado === "ACTIVO"
            ? "default"
            : estado === "CERRADO"
              ? "secondary"
              : "outline";
        return (
          <Badge variant={variant} className="text-xs">
            {label}
          </Badge>
        );
      },
      size: 10,
    },
    {
      id: "horas",
      header: "Horas",
      accessorFn: (row) => row.horas,
      cell: ({ row }) => (
        <span className="text-right font-mono tabular-nums block">
          {formatHoras(row.original.horas)}
        </span>
      ),
      size: 10,
    },
    {
      id: "importe",
      header: "Importe",
      accessorFn: (row) => row.importe,
      cell: ({ row }) => (
        <span className="text-right font-mono tabular-nums block">
          {mxn.format(row.original.importe)}
        </span>
      ),
      size: 12,
    },
  ];
