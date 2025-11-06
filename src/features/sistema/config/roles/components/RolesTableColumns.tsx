"use client";

import { ColumnDef } from "@tanstack/react-table";
import { RoleDto } from "../types/RoleDto.dto";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { RowCellActions } from "./columns/RowCellActions";

export const RolesTableColumns: ColumnDef<RoleDto>[] = [
  {
    header: "ID",
    accessorKey: "id",
    cell: ({ row }) => (
      <div className="font-mono text-sm font-medium truncate">
        {row.getValue("id")?.toString().substring(0, 8)}...
      </div>
    ),
    size: 8,
  },
  {
    header: "Nombre",
    accessorKey: "name",
    cell: ({ row }) => (
      <div className="font-medium truncate">{row.getValue("name")}</div>
    ),
    size: 25,
  },
  {
    header: "Fecha Creación",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const fecha = format(new Date(row.getValue("createdAt")), "dd/MM/yy", {
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
    header: "Fecha Actualización",
    accessorKey: "updatedAt",
    cell: ({ row }) => {
      const fecha = format(new Date(row.getValue("updatedAt")), "dd/MM/yy", {
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
    cell: ({ row }) => <RowCellActions row={row} />,
    size: 5,
    enableHiding: false,
  },
];

