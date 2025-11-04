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
import { UserDto } from "../server/dtos/UserDto.dto";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const UserTableColumns: ColumnDef<UserDto>[] = [
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
    header: "Email",
    accessorKey: "email",
    cell: ({ row }) => (
      <div className="font-medium truncate">{row.getValue("email")}</div>
    ),
    size: 25,
  },
  {
    header: "Nombre",
    accessorKey: "name",
    cell: ({ row }) => (
      <div className="text-sm font-mono truncate">{row.getValue("name")}</div>
    ),
    size: 12,
  },
  {
    header: "Roles",
    accessorKey: "roles",
    cell: ({ row }) => {
      const roles = row.getValue("roles") as string;
      return <Badge variant="destructive">Roles</Badge>;
    },
    size: 10,
  },
  {
    header: "Fecha Creacion",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const fecha = format(row.getValue("createdAt"), "dd/MM/yy", {
        locale: es,
      });

      return (
        <>
          <div className="text-sm truncate">{fecha}</div>
        </>
      );
    },
    size: 15,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => <RowActions row={row} />,
    size: 5,
    enableHiding: false,
  },
];

function RowActions({ row: _row }: { row: Row<UserDto> }) {
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
        <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
