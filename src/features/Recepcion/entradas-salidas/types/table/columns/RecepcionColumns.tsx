"use client";
import { EllipsisIcon } from "lucide-react";
import { Button } from "@/core/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/shared/ui/dropdown-menu";
import { Badge } from "@/core/shared/ui/badge";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Visitante } from "../columTypes/Visitante.type";

export const RecepcionColumns: ColumnDef<Visitante>[] = [
  {
    header: "ID",
    accessorKey: "id",
    cell: ({ row }) => (
      <div className="font-mono text-sm font-medium truncate">
        {row.getValue("id")}
      </div>
    ),
    size: 8,
  },
  {
    header: "Visitante",
    accessorKey: "nombre",
    cell: ({ row }) => (
      <div className="font-medium truncate">{row.getValue("nombre")}</div>
    ),
    size: 20,
  },
  {
    header: "Destinatario",
    accessorKey: "destinatario",
    cell: ({ row }) => (
      <div className="text-sm truncate">{row.getValue("destinatario")}</div>
    ),
    size: 25,
  },
  {
    header: "Motivo",
    accessorKey: "motivo",
    cell: ({ row }) => (
      <div className="text-sm truncate">{row.getValue("motivo")}</div>
    ),
    size: 20,
  },
  {
    header: "Teléfono",
    accessorKey: "telefonoContacto",
    cell: ({ row }) => (
      <div className="text-sm font-mono truncate">
        {row.getValue("telefonoContacto")}
      </div>
    ),
    size: 15,
  },
  {
    header: "Correspondencia",
    accessorKey: "correspondencia",
    cell: ({ row }) => {
      const correspondencia = row.getValue("correspondencia") as string;
      return correspondencia ? (
        <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
          {correspondencia}
        </Badge>
      ) : (
        <span className="text-gray-400 text-xs">-</span>
      );
    },
    size: 12,
  },
  {
    header: "Hora Entrada",
    accessorKey: "horaEntrada",
    cell: ({ row }) => (
      <div className="text-sm font-mono truncate">
        {row.getValue("horaEntrada")}
      </div>
    ),
    size: 10,
  },
  {
    header: "Hora Salida",
    accessorKey: "horaSalida",
    cell: ({ row }) => {
      const horaSalida = row.getValue("horaSalida") as string;
      return horaSalida ? (
        <div className="text-sm font-mono truncate">{horaSalida}</div>
      ) : (
        <Badge
          variant="secondary"
          className="text-xs bg-orange-100 text-orange-800"
        >
          En el despacho
        </Badge>
      );
    },
    size: 12,
  },
  {
    header: "Estado",
    accessorKey: "horaSalida",
    cell: ({ row }) => {
      const horaSalida = row.getValue("horaSalida") as string;
      return horaSalida ? (
        <Badge
          variant="default"
          className="text-xs bg-green-100 text-green-800"
        >
          Salido
        </Badge>
      ) : (
        <Badge
          variant="secondary"
          className="text-xs bg-blue-100 text-blue-800"
        >
          Dentro
        </Badge>
      );
    },
    size: 8,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => <RowActions row={row} />,
    size: 5,
    enableHiding: false,
  },
];

function RowActions({ row }: { row: Row<Visitante> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
          <EllipsisIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Editar</DropdownMenuItem>
        <DropdownMenuItem>Ver detalles</DropdownMenuItem>
        <DropdownMenuItem>Registrar salida</DropdownMenuItem>
        <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
