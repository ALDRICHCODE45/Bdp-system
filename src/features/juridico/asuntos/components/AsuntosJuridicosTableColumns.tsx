"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/core/shared/ui/badge";
import type { AsuntoJuridicoDto } from "../server/dtos/AsuntoJuridicoDto.dto";
import { AsuntoJuridicoRowActions } from "./AsuntoJuridicoRowActions";

const estadoBadgeConfig: Record<
  string,
  { label: string; className: string }
> = {
  ACTIVO: {
    label: "Activo",
    className: "bg-green-100 text-green-800 text-xs",
  },
  INACTIVO: {
    label: "Inactivo",
    className: "bg-yellow-100 text-yellow-800 text-xs",
  },
  CERRADO: {
    label: "Cerrado",
    className: "bg-red-100 text-red-800 text-xs",
  },
};

export const asuntosJuridicosColumns: ColumnDef<AsuntoJuridicoDto>[] = [
  {
    header: "Nombre",
    accessorKey: "nombre",
    cell: ({ row }) => (
      <div className="font-medium truncate max-w-[200px]">
        {row.getValue("nombre")}
      </div>
    ),
    size: 25,
    filterFn: (row, id, value: string) => {
      if (!value) return true;
      const nombre = (row.getValue(id) as string).toLowerCase();
      return nombre.includes(value.toLowerCase());
    },
  },
  {
    header: "Estado",
    accessorKey: "estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado") as string;
      const config = estadoBadgeConfig[estado] ?? {
        label: estado,
        className: "bg-gray-100 text-gray-600 text-xs",
      };
      return (
        <Badge variant="secondary" className={config.className}>
          {config.label}
        </Badge>
      );
    },
    size: 12,
  },
  {
    header: "Cliente Jurídico",
    accessorKey: "clienteJuridicoNombre",
    cell: ({ row }) => {
      const nombre = row.getValue("clienteJuridicoNombre") as string | null;
      return nombre ? (
        <div className="text-sm truncate max-w-[180px]">{nombre}</div>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      );
    },
    size: 25,
  },
  {
    header: "Socio",
    accessorKey: "socioNombre",
    cell: ({ row }) => {
      const nombre = row.getValue("socioNombre") as string | null;
      return nombre ? (
        <div className="text-sm truncate max-w-[180px]">{nombre}</div>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      );
    },
    size: 20,
  },
  {
    header: "Descripción",
    accessorKey: "descripcion",
    cell: ({ row }) => {
      const desc = row.getValue("descripcion") as string | null;
      if (!desc) return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <div className="text-sm text-muted-foreground truncate max-w-[220px]">
          {desc}
        </div>
      );
    },
    size: 25,
  },
  {
    header: "Fecha de creación",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt") as string);
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      );
    },
    size: 15,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => <AsuntoJuridicoRowActions row={row} />,
    size: 5,
    enableHiding: false,
  },
];
