"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/core/shared/ui/badge";
import type { EquipoJuridicoDto } from "../server/dtos/EquipoJuridicoDto.dto";
import { EquipoJuridicoRowActions } from "./EquipoJuridicoRowActions";
import { Users } from "lucide-react";

export const equiposJuridicosColumns: ColumnDef<EquipoJuridicoDto>[] = [
  {
    header: "Nombre",
    accessorKey: "nombre",
    cell: ({ row }) => (
      <div className="font-medium truncate max-w-[200px]">
        {row.getValue("nombre")}
      </div>
    ),
    size: 30,
    filterFn: (row, id, value: string) => {
      if (!value) return true;
      const nombre = (row.getValue(id) as string).toLowerCase();
      return nombre.includes(value.toLowerCase());
    },
  },
  {
    header: "Descripción",
    accessorKey: "descripcion",
    cell: ({ row }) => {
      const descripcion = row.getValue("descripcion") as string | null;
      return descripcion ? (
        <div className="text-sm truncate max-w-[300px]">{descripcion}</div>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      );
    },
    size: 40,
  },
  {
    header: "Miembros",
    accessorKey: "miembrosCount",
    cell: ({ row }) => {
      const count = row.getValue("miembrosCount") as number;
      return (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 w-fit text-xs"
        >
          <Users className="h-3 w-3" />
          {count}
        </Badge>
      );
    },
    size: 15,
  },
  {
    header: "Creado",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      return (
        <div className="text-sm text-muted-foreground">
          {new Date(createdAt).toLocaleDateString("es-MX", {
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
    cell: ({ row }) => <EquipoJuridicoRowActions row={row} />,
    size: 5,
    enableHiding: false,
  },
];
