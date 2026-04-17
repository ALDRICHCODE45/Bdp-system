"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/core/shared/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { ClienteJuridicoDto } from "../server/dtos/ClienteJuridicoDto.dto";
import { ClienteJuridicoRowActions } from "./ClienteJuridicoRowActions";

export const clientesJuridicosColumns: ColumnDef<ClienteJuridicoDto>[] = [
  {
    header: "Nombre",
    accessorKey: "nombre",
    cell: ({ row }) => (
      <div className="font-medium truncate max-w-[200px]">
        {row.getValue("nombre")}
      </div>
    ),
    size: 25,
  },
  {
    header: "RFC",
    accessorKey: "rfc",
    cell: ({ row }) => {
      const rfc = row.getValue("rfc") as string | null;
      return rfc ? (
        <div className="text-sm font-mono truncate">{rfc}</div>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      );
    },
    size: 15,
  },
  {
    header: "Email",
    accessorKey: "email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string | null;
      return email ? (
        <div className="text-sm truncate">{email}</div>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      );
    },
    size: 20,
  },
  {
    header: "Teléfono",
    accessorKey: "telefono",
    cell: ({ row }) => {
      const telefono = row.getValue("telefono") as string | null;
      return telefono ? (
        <div className="text-sm truncate">{telefono}</div>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      );
    },
    size: 15,
  },
  {
    header: "Contacto",
    accessorKey: "contacto",
    cell: ({ row }) => {
      const contacto = row.getValue("contacto") as string | null;
      return contacto ? (
        <div className="text-sm truncate">{contacto}</div>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      );
    },
    size: 20,
  },
  {
    header: "Dirección",
    accessorKey: "direccion",
    cell: ({ row }) => {
      const direccion = row.getValue("direccion") as string | null;
      return direccion ? (
        <div className="text-sm truncate max-w-[200px]">{direccion}</div>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      );
    },
    size: 20,
  },
  {
    header: "Notas",
    accessorKey: "notas",
    cell: ({ row }) => {
      const notas = row.getValue("notas") as string | null;
      return notas ? (
        <div className="text-sm truncate max-w-[200px]">{notas}</div>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      );
    },
    size: 20,
  },
  {
    header: "Estado",
    accessorKey: "activo",
    cell: ({ row }) => {
      const activo = row.getValue("activo") as boolean;
      return (
        <Badge
          variant={activo ? "default" : "secondary"}
          className={
            activo
              ? "bg-green-100 text-green-800 text-xs"
              : "bg-gray-100 text-gray-600 text-xs"
          }
        >
          {activo ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
    size: 10,
    enableHiding: false,
  },
  {
    header: "Fecha de registro",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      try {
        return (
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {format(new Date(createdAt), "d MMM yyyy", { locale: es })}
          </div>
        );
      } catch {
        return <span className="text-muted-foreground text-xs">—</span>;
      }
    },
    size: 15,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => <ClienteJuridicoRowActions row={row} />,
    size: 5,
    enableHiding: false,
    enableSorting: false,
  },
];
