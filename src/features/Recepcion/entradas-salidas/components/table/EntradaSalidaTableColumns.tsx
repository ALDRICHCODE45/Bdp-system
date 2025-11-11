"use client";
import { ColumnDef } from "@tanstack/react-table";
import { EntradasSalidasDTO } from "../../server/dtos/EntradasSalidasDto.dto";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EntradaSalidaRowActions } from "../forms/EntradaSalidaRowActions";

export const EntradasSalidasTableColumns: ColumnDef<EntradasSalidasDTO>[] = [
  {
    header: "Visitante",
    accessorKey: "visitante",
    cell: ({ row }) => (
      <div className="font-medium truncate">{row.getValue("visitante")}</div>
    ),
    size: 20,
  },
  {
    header: "Motivo",
    accessorKey: "motivo",
    cell: ({ row }) => (
      <div className="text-sm truncate">{row.getValue("motivo")}</div>
    ),
    size: 25,
  },
  {
    header: "Destinatario",
    accessorKey: "destinatario",
    cell: ({ row }) => (
      <div className="text-sm truncate">{row.getValue("destinatario")}</div>
    ),
    size: 15,
  },
  {
    header: "Telefono",
    accessorKey: "telefono",
    cell: ({ row }) => {
      return <div>{row.getValue("telefono")}</div>;
    },
    size: 8,
  },
  {
    header: "Fecha",
    accessorKey: "fecha",
    cell: ({ row }) => {
      const fecha = row.original.fecha as Date;
      if (!fecha) return <div>-</div>;

      const fechaFormateada = format(new Date(fecha), "dd/MM/yyyy", {
        locale: es,
      });

      return <div className="text-sm truncate">{fechaFormateada}</div>;
    },
    size: 10,
  },
  {
    header: "Hora Entrada",
    accessorKey: "hora_entrada",
    cell: ({ row }) => {
      const horaEntrada = row.original.hora_entrada as Date;
      if (!horaEntrada) return <div>-</div>;

      const horaFormateada = format(new Date(horaEntrada), "HH:mm", {
        locale: es,
      });

      return <div className="text-sm truncate">{horaFormateada}</div>;
    },
    size: 10,
  },
  {
    header: "Hora Salida",
    accessorKey: "hora_salida",
    cell: ({ row }) => {
      const horaSalida = row.original.hora_salida as Date | null | undefined;
      if (!horaSalida) {
        return (
          <div className="text-sm truncate text-muted-foreground">
            <span className="italic">Pendiente</span>
          </div>
        );
      }
      
      const horaFormateada = format(new Date(horaSalida), "HH:mm", {
        locale: es,
      });

      return <div className="text-sm truncate">{horaFormateada}</div>;
    },
    size: 10,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => <EntradaSalidaRowActions row={row} />,
    size: 5,
    enableHiding: false,
  },
];
