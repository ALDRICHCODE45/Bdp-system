"use client";
import { ColumnDef, Row } from "@tanstack/react-table";
import { UserDto } from "../server/dtos/UserDto.dto";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { RolesCell } from "./columns/RolesCell";
import { RowCellActions } from "./columns/RowCellActions";
import { Badge } from "@/core/shared/ui/badge";
import getUserStatusColors from "../helpers/getUserStatusColors.helper";

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
      const roles = row.getValue("roles") as string[];
      return <RolesCell roles={roles} />;
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
    header: "Estado",
    accessorKey: "isActive",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge
          variant={"outline"}
          className={`${getUserStatusColors(isActive)}`}
        >
          {isActive ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
    size: 10,
    enableHiding: true,
    enableColumnFilter: true,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => <RowCellActions row={row} />,
    size: 5,
    enableHiding: false,
  },
];
