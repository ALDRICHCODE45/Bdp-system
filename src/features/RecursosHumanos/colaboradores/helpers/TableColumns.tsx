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
import { cn } from "@/core/lib/utils";

import { ColumnDef, Row } from "@tanstack/react-table";
import { User } from "../types/ColaboradoresTableTypes.type";

export const columns: ColumnDef<User>[] = [
  {
    header: "Nombre",
    accessorKey: "nombre",
    cell: ({ row }) => (
      <div className="font-medium  truncate">{row.getValue("nombre")}</div>
    ),
    size: 20,
  },
  {
    header: "Email",
    accessorKey: "email",
    cell: ({ row }) => (
      <div className="text-sm  truncate">{row.getValue("email")}</div>
    ),
    size: 25,
  },
  {
    header: "Posición",
    accessorKey: "posicion",
    cell: ({ row }) => (
      <div className="text-sm truncate">{row.getValue("posicion")}</div>
    ),
    size: 15,
  },
  {
    header: "Estado",
    accessorKey: "activo",
    cell: ({ row }) => (
      <Badge
        variant={row.getValue("activo") ? "default" : "secondary"}
        className={cn(
          "text-xs",
          row.getValue("activo")
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-800"
        )}
      >
        {row.getValue("activo") ? "Activo" : "Inactivo"}
      </Badge>
    ),
    size: 8,
  },
  {
    header: "IMSS",
    accessorKey: "activo_Imss",
    cell: ({ row }) => (
      <Badge
        variant={row.getValue("activo_Imss") ? "default" : "secondary"}
        className={cn(
          "text-xs",
          row.getValue("activo_Imss")
            ? "bg-blue-100 text-blue-800"
            : "bg-gray-100 text-gray-800"
        )}
      >
        {row.getValue("activo_Imss") ? "Sí" : "No"}
      </Badge>
    ),
    size: 6,
  },
  {
    header: "Jefe Inmediato",
    accessorKey: "jefe_inmediato",
    cell: ({ row }) => (
      <div className="text-sm truncate">{row.getValue("jefe_inmediato")}</div>
    ),
    size: 12,
  },
  {
    header: "Banco",
    accessorKey: "banco",
    cell: ({ row }) => (
      <div className="text-sm truncate">{row.getValue("banco")}</div>
    ),
    size: 8,
  },
  {
    header: "CLABE",
    accessorKey: "clave_Interbancaria",
    cell: ({ row }) => (
      <div className="text-sm font-mono  truncate">
        {row.getValue("clave_Interbancaria")}
      </div>
    ),
    size: 10,
  },
  {
    header: "Sueldo",
    accessorKey: "sueldo",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("sueldo"));
      const formatted = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(amount);

      return <div className="font-medium  truncate">{formatted}</div>;
    },
    size: 10,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => <RowActions row={row} />,
    size: 5,
    enableHiding: false,
  },
];

function RowActions({}: { row: Row<User> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
          <EllipsisIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Editar</DropdownMenuItem>
        <DropdownMenuItem>Ver perfil</DropdownMenuItem>
        <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
