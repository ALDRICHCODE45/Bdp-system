"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/core/shared/ui/checkbox";
import { Badge } from "@/core/shared/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/shared/ui/tooltip";
import { cn } from "@/core/lib/utils";
import { FacturaDto } from "../server/dtos/FacturaDto.dto";
import { FacturaRowActions } from "./forms/FacturaRowActions";
import { FacturaStatusBadge } from "./FacturaStatusBadge";

/**
 * Returns a locale-aware currency formatter for the given currency code.
 * Cached per-currency to avoid re-creating Intl objects on every render.
 */
const currencyFormatterCache = new Map<string, Intl.NumberFormat>();

export function getCurrencyFormatter(currency: string): Intl.NumberFormat {
  const key = currency || "MXN";
  if (!currencyFormatterCache.has(key)) {
    currencyFormatterCache.set(
      key,
      new Intl.NumberFormat("es-MX", { style: "currency", currency: key })
    );
  }
  return currencyFormatterCache.get(key)!;
}

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const statusPagoColors: Record<string, string> = {
  Vigente:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-0",
  Cancelado: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0",
  NoPagado:
    "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-0",
};

const statusPagoLabels: Record<string, string> = {
  NoPagado: "No Pagado",
};

export function createFacturasColumns(
  onViewDetail: (factura: FacturaDto) => void
): ColumnDef<FacturaDto>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 2,
    },
    {
      accessorKey: "concepto",
      header: "Concepto",
      cell: ({ row }) => {
        const concepto = row.getValue("concepto") as string;
        const rfcReceptor = row.original.rfcReceptor;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium truncate max-w-[200px]">{concepto}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{rfcReceptor}</span>
          </div>
        );
      },
      size: 22,
    },
    {
      accessorKey: "uuid",
      header: "UUID",
      cell: ({ row }) => {
        const uuid = row.getValue("uuid") as string;
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[100px] truncate font-mono text-xs">
                {uuid}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-mono text-xs">{uuid}</p>
            </TooltipContent>
          </Tooltip>
        );
      },
      size: 14,
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => {
        const total = row.getValue("total") as number;
        const fmt = getCurrencyFormatter(row.original.moneda);
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-foreground text-sm">{fmt.format(total)}</span>
            <Badge variant="outline" className="font-mono text-xs w-fit">
              {row.original.moneda}
            </Badge>
          </div>
        );
      },
      size: 12,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <FacturaStatusBadge status={status} />;
      },
      size: 10,
    },
    {
      accessorKey: "statusPago",
      header: "Status Pago",
      cell: ({ row }) => {
        const statusPago = row.getValue("statusPago") as string | null;
        if (!statusPago)
          return <div className="text-xs text-muted-foreground">-</div>;
        return (
          <Badge
            variant="secondary"
            className={cn("border-0", statusPagoColors[statusPago])}
          >
            {statusPagoLabels[statusPago] || statusPago}
          </Badge>
        );
      },
      size: 10,
    },
    {
      accessorKey: "createdAt",
      header: "Fecha Registro",
      cell: ({ row }) => {
        const fecha = row.getValue("createdAt") as string;
        return (
          <div className="text-xs">
            {dateFormatter.format(new Date(fecha))}
          </div>
        );
      },
      size: 10,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Acciones</span>,
      cell: ({ row }) => (
        <FacturaRowActions row={row} onViewDetail={onViewDetail} />
      ),
      enableHiding: false,
      size: 8,
    },
  ];
}

// Keep the old export for backward compatibility (some imports may still use it)
export const columns = createFacturasColumns(() => {});
