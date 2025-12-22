"use client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AsistenciaWithColaborador } from "../server/mappers/AsistenciaMapper";
import { Badge } from "@/core/shared/ui/badge";

export const asistenciaColaboradoresColumns: ColumnDef<AsistenciaWithColaborador>[] =
  [
    {
      header: "Tipo",
      accessorKey: "tipo",
      cell: ({ row }) => {
        const value = row.original.tipo;

        const valueColorMap = {
          Entrada: "success-outline",
          Salida: "info-outline",
        };
        return (
          <>
            <Badge variant={valueColorMap[value] as "success"}>{value}</Badge>
          </>
        );
      },
      size: 20,
    },
    {
      header: "Correo",
      accessorKey: "correo",
      size: 20,
    },
    {
      header: "Nombre",
      cell: ({ row }) => {
        const nombre = row.original.colaborador.name;
        return (
          <>
            <div>{nombre}</div>
          </>
        );
      },
      size: 20,
    },
    {
      header: "Hora",
      accessorKey: "fecha",
      cell: ({ row }) => {
        const fecha = row.original.fecha;
        const fechaFormateada = format(fecha, "EEE dd/MM/yyyy 'a las' h:mma", {
          locale: es,
        });

        return (
          <>
            <div>{fechaFormateada}</div>
          </>
        );
      },
      size: 20,
    },
  ];
