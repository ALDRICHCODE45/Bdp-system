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
import { ClienteProveedor } from "../types/ClienteProveedor.type";

export const ClientesProveedoresColumns: ColumnDef<ClienteProveedor>[] = [
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
    header: "Nombre/Razón Social",
    accessorKey: "nombre",
    cell: ({ row }) => (
      <div className="font-medium truncate">{row.getValue("nombre")}</div>
    ),
    size: 25,
  },
  {
    header: "RFC",
    accessorKey: "rfc",
    cell: ({ row }) => (
      <div className="text-sm font-mono truncate">{row.getValue("rfc")}</div>
    ),
    size: 12,
  },
  {
    header: "Tipo",
    accessorKey: "tipo",
    cell: ({ row }) => {
      const tipo = row.getValue("tipo") as string;
      return (
        <Badge
          variant={tipo === "cliente" ? "default" : "secondary"}
          className={cn(
            "text-xs",
            tipo === "cliente"
              ? "bg-blue-100 text-blue-800"
              : "bg-green-100 text-green-800"
          )}
        >
          {tipo === "cliente" ? "Cliente" : "Proveedor"}
        </Badge>
      );
    },
    size: 10,
  },
  {
    header: "Contacto",
    accessorKey: "contacto",
    cell: ({ row }) => (
      <div className="text-sm truncate">{row.getValue("contacto")}</div>
    ),
    size: 15,
  },
  {
    header: "Teléfono",
    accessorKey: "telefono",
    cell: ({ row }) => (
      <div className="text-sm font-mono truncate">
        {row.getValue("telefono")}
      </div>
    ),
    size: 12,
  },
  {
    header: "Email",
    accessorKey: "email",
    cell: ({ row }) => (
      <div className="text-sm truncate">{row.getValue("email")}</div>
    ),
    size: 20,
  },
  {
    header: "Banco",
    accessorKey: "banco",
    cell: ({ row }) => {
      const banco = row.getValue("banco") as string;
      return banco ? (
        <div className="text-sm truncate">{banco}</div>
      ) : (
        <span className="text-gray-400 text-xs">-</span>
      );
    },
    size: 10,
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
    header: "Fecha Registro",
    accessorKey: "fechaRegistro",
    cell: ({ row }) => {
      const fecha = row.getValue("fechaRegistro") as string;
      const fechaFormateada = new Date(fecha).toLocaleDateString("es-MX");
      return <div className="text-sm truncate">{fechaFormateada}</div>;
    },
    size: 12,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => <RowActions row={row} />,
    size: 5,
    enableHiding: false,
  },
];

function RowActions({ row: _row }: { row: Row<ClienteProveedor> }) {
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
        <DropdownMenuItem>Ver facturas</DropdownMenuItem>
        <DropdownMenuItem>Ver transacciones</DropdownMenuItem>
        <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
