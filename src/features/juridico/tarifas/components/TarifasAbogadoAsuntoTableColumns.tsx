"use client";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/core/shared/ui/badge";
import type { TarifaAbogadoAsuntoDto } from "../server/dtos/TarifaAbogadoAsuntoDto.dto";
import { TarifaRowActions } from "./TarifaRowActions";

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatTarifa(raw: string): string {
  const n = Number(raw);
  return Number.isFinite(n) ? mxn.format(n) : raw;
}

export const tarifasAbogadoAsuntoColumns: ColumnDef<TarifaAbogadoAsuntoDto>[] =
  [
    {
      id: "abogado",
      header: "Abogado",
      accessorFn: (row) => row.usuarioNombre,
      cell: ({ row }) => (
        <div className="font-medium truncate max-w-[200px]">
          {row.original.usuarioNombre}
        </div>
      ),
      size: 25,
    },
    {
      id: "asunto",
      header: "Asunto jurídico",
      accessorFn: (row) => row.asuntoJuridicoNombre,
      cell: ({ row }) => (
        <div className="text-sm truncate max-w-[240px]">
          {row.original.asuntoJuridicoNombre}
        </div>
      ),
      size: 30,
    },
    {
      id: "tarifaHora",
      header: "Tarifa por hora",
      accessorFn: (row) => Number(row.tarifaHora),
      cell: ({ row }) => (
        <span className="font-mono tabular-nums text-sm">
          {formatTarifa(row.original.tarifaHora)}
        </span>
      ),
      size: 15,
    },
    {
      id: "activa",
      header: "Estado",
      accessorFn: (row) => row.activa,
      cell: ({ row }) =>
        row.original.activa ? (
          <Badge className="bg-green-100 text-green-800 text-xs">Activa</Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            Inactiva
          </Badge>
        ),
      size: 12,
    },
    {
      id: "updatedAt",
      header: "Última edición",
      accessorFn: (row) => row.updatedAt,
      cell: ({ row }) => {
        const d = new Date(row.original.updatedAt);
        return (
          <div className="text-xs text-muted-foreground">
            {d.toLocaleDateString("es-MX", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </div>
        );
      },
      size: 14,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Acciones</span>,
      cell: ({ row }) => <TarifaRowActions tarifa={row.original} />,
      size: 5,
      enableHiding: false,
    },
  ];
