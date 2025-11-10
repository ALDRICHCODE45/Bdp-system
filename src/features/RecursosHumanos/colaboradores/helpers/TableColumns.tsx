"use client";
import { Badge } from "@/core/shared/ui/badge";
import { cn } from "@/core/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ColaboradorDto } from "../server/dtos/ColaboradorDto.dto";
import { RhRowActions } from "../components/forms/RhFormRowActions";
import { ActivosRowPopOver } from "../components/ActivosRowPopOver";

export const columns: ColumnDef<ColaboradorDto>[] = [
  {
    header: "Nombre",
    accessorKey: "name",
    cell: ({ row }) => (
      <div className="font-medium truncate">{row.getValue("name")}</div>
    ),
    size: 20,
  },
  {
    header: "Correo",
    accessorKey: "correo",
    cell: ({ row }) => (
      <div className="text-sm truncate">{row.getValue("correo")}</div>
    ),
    size: 25,
  },
  {
    header: "Puesto",
    accessorKey: "puesto",
    cell: ({ row }) => (
      <div className="text-sm truncate">{row.getValue("puesto")}</div>
    ),
    size: 15,
  },
  {
    header: "Estado",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={status === "CONTRATADO" ? "default" : "secondary"}
          className={cn(
            "text-xs",
            status === "CONTRATADO"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          )}
        >
          {status === "CONTRATADO" ? "Contratado" : "Despedido"}
        </Badge>
      );
    },
    size: 8,
  },
  {
    header: "IMSS",
    accessorKey: "imss",
    cell: ({ row }) => (
      <Badge
        variant={row.getValue("imss") ? "default" : "secondary"}
        className={cn(
          "text-xs",
          row.getValue("imss")
            ? "bg-blue-100 text-blue-800"
            : "bg-gray-100 text-gray-800"
        )}
      >
        {row.getValue("imss") ? "Sí" : "No"}
      </Badge>
    ),
    size: 6,
  },
  {
    header: "Socio Responsable",
    accessorKey: "socio",
    cell: ({ row }) => {
      const socio = row.getValue("socio") as { nombre: string } | null;
      return (
        <div className="text-sm truncate">
          {socio ? socio.nombre : "Sin asignar"}
        </div>
      );
    },
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
    accessorKey: "clabe",
    cell: ({ row }) => (
      <div className="text-sm font-mono truncate">{row.getValue("clabe")}</div>
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

      return <div className="font-medium truncate">{formatted}</div>;
    },
    size: 10,
  },

  {
    header: "Activos",
    accessorKey: "activos",
    cell: ({ row }) => {
      return <ActivosRowPopOver row={row} />;
    },
    size: 10,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => <RhRowActions row={row} />,
    size: 5,
    enableHiding: false,
  },
];
