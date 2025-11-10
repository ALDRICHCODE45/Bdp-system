"use client";
import { Badge } from "@/core/shared/ui/badge";
import { cn } from "@/core/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { SocioDto } from "../server/dtos/SocioDto.dto";
import { SociosRowActions } from "../components/forms/SociosRowActions";

export const columns: ColumnDef<SocioDto>[] = [
  {
    header: "Nombre",
    accessorKey: "nombre",
    cell: ({ row }) => (
      <div className="font-medium truncate">{row.getValue("nombre")}</div>
    ),
    size: 25,
  },
  {
    header: "Email",
    accessorKey: "email",
    cell: ({ row }) => (
      <div className="text-sm truncate">{row.getValue("email")}</div>
    ),
    size: 25,
  },
  {
    header: "Teléfono",
    accessorKey: "telefono",
    cell: ({ row }) => {
      const telefono = row.getValue("telefono") as string | null;
      return <div className="text-sm truncate">{telefono || "N/A"}</div>;
    },
    size: 15,
  },
  {
    header: "Departamento",
    accessorKey: "departamento",
    cell: ({ row }) => {
      const departamento = row.getValue("departamento") as string | null;
      return <div className="text-sm truncate">{departamento || "N/A"}</div>;
    },
    size: 15,
  },
  {
    header: "N° Colaboradores",
    accessorKey: "numeroEmpleados",
    cell: ({ row }) => (
      <div className="text-sm text-center">{row.original.numeroEmpleados}</div>
    ),
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
    size: 10,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => <SociosRowActions row={row} />,
    size: 5,
    enableHiding: false,
  },
];
