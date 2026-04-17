"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/core/shared/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import type { RegistroHoraDto } from "../server/dtos/RegistroHoraDto.dto";
import { RegistroHoraRowActions } from "./RegistroHoraRowActions";
import { formatHoras } from "../helpers/formatHoras";

function formatWeekLabel(ano: number, semana: number): string {
  return `Sem ${semana} - ${ano}`;
}

export const registroHorasColumns: ColumnDef<RegistroHoraDto>[] = [
  {
    header: "Semana",
    id: "semana",
    accessorFn: (row) => `${row.semana}-${row.ano}`,
    cell: ({ row }) => (
      <div className="font-medium whitespace-nowrap text-sm">
        {formatWeekLabel(row.original.ano, row.original.semana)}
      </div>
    ),
    size: 12,
  },
  {
    header: "Equipo",
    accessorKey: "equipoJuridicoNombre",
    cell: ({ row }) => (
      <div className="text-sm truncate max-w-[120px]">
        {row.getValue("equipoJuridicoNombre")}
      </div>
    ),
    size: 15,
  },
  {
    header: "Cliente",
    accessorKey: "clienteJuridicoNombre",
    cell: ({ row }) => (
      <div className="text-sm truncate max-w-[120px]">
        {row.getValue("clienteJuridicoNombre")}
      </div>
    ),
    size: 15,
  },
  {
    header: "Asunto",
    accessorKey: "asuntoJuridicoNombre",
    cell: ({ row }) => (
      <div className="text-sm truncate max-w-[150px]">
        {row.getValue("asuntoJuridicoNombre")}
      </div>
    ),
    size: 18,
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
        <div
          className="text-sm truncate max-w-[180px]"
          title={desc}
        >
          {desc}
        </div>
      );
    },
    size: 18,
  },
  {
    header: "Editable",
    accessorKey: "editable",
    cell: ({ row }) => {
      const editable = row.getValue("editable") as boolean;
      return editable ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-gray-400" />
      );
    },
    size: 8,
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
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => <RegistroHoraRowActions row={row} />,
    size: 5,
    enableHiding: false,
  },
];
