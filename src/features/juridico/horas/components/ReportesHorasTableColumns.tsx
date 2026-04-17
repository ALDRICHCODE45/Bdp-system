"use client";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/core/shared/ui/badge";
import type { ReporteHorasRowDto } from "../server/dtos/ReporteHorasDto.dto";
import { formatHoras } from "../helpers/formatHoras";

function formatWeekLabel(semana: number, ano: number): string {
  return `Sem ${semana} - ${ano}`;
}

export const reporteHorasColumns: ColumnDef<ReporteHorasRowDto>[] = [
  {
    header: "Abogado",
    accessorKey: "usuarioNombre",
    cell: ({ row }) => (
      <div>
        <div className="text-sm font-medium">{row.original.usuarioNombre}</div>
        <div className="text-xs text-muted-foreground">
          {row.original.usuarioEmail}
        </div>
      </div>
    ),
    size: 18,
  },
  {
    header: "Equipo",
    accessorKey: "equipoNombre",
    cell: ({ row }) => (
      <div className="text-sm truncate max-w-[120px]">
        {row.getValue("equipoNombre")}
      </div>
    ),
    size: 14,
  },
  {
    header: "Cliente",
    accessorKey: "clienteNombre",
    cell: ({ row }) => (
      <div className="text-sm truncate max-w-[120px]">
        {row.getValue("clienteNombre")}
      </div>
    ),
    size: 14,
  },
  {
    header: "Asunto",
    accessorKey: "asuntoNombre",
    cell: ({ row }) => (
      <div className="text-sm truncate max-w-[150px]">
        {row.getValue("asuntoNombre")}
      </div>
    ),
    size: 16,
  },
  {
    header: "Socio",
    accessorKey: "socioNombre",
    cell: ({ row }) => (
      <div className="text-sm truncate max-w-[120px]">
        {row.getValue("socioNombre")}
      </div>
    ),
    size: 12,
  },
  {
    header: "Semana",
    id: "semana",
    accessorFn: (row) => `${row.semana}-${row.ano}`,
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono text-xs whitespace-nowrap">
        {formatWeekLabel(row.original.semana, row.original.ano)}
      </Badge>
    ),
    size: 12,
  },
  {
    header: "Horas",
    accessorKey: "horas",
    cell: ({ row }) => {
      const horas = row.getValue("horas") as number;
      return (
        <Badge
          variant="secondary"
          className="bg-blue-50 text-blue-800 font-mono text-xs"
        >
          {formatHoras(horas)}
        </Badge>
      );
    },
    size: 8,
  },
  {
    header: "Descripción",
    accessorKey: "descripcion",
    cell: ({ row }) => {
      const desc = row.getValue("descripcion") as string | null;
      if (!desc) return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <div className="text-sm truncate max-w-[180px]" title={desc}>
          {desc}
        </div>
      );
    },
    size: 18,
  },
  {
    header: "Registrado",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt") as string);
      return (
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {date.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      );
    },
    size: 12,
  },
];
