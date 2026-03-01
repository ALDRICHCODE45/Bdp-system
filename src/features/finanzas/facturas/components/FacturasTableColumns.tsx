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
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

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
      new Intl.NumberFormat("es-MX", { style: "currency", currency: key }),
    );
  }
  return currencyFormatterCache.get(key)!;
}

const formatDate = (isoString: string) =>
  format(parseISO(isoString), "d MMM yyyy", { locale: es });

const formatDateTime = (isoString: string) =>
  format(parseISO(isoString), "d MMM yyyy HH:mm", { locale: es });

const statusPagoColors: Record<string, string> = {
  Vigente:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-0",
  Cancelado:
    "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-0",
  NoPagado:
    "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-0",
};

const statusPagoLabels: Record<string, string> = {
  NoPagado: "No Pagado",
};

/** Celda vacía estándar para valores nulos */
const EmptyCell = () => (
  <span className="text-xs text-muted-foreground">—</span>
);

/** Celda de texto simple con truncado */
function TextCell({
  value,
  mono = false,
  maxWidth = 160,
}: {
  value: string | null | undefined;
  mono?: boolean;
  maxWidth?: number;
}) {
  if (!value) return <EmptyCell />;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn("text-xs truncate block", mono && "font-mono")}
          style={{ maxWidth }}
        >
          {value}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className={cn("text-xs", mono && "font-mono")}>{value}</p>
      </TooltipContent>
    </Tooltip>
  );
}

/** Celda de monto formateado con moneda */
function AmountCell({
  value,
  currency,
}: {
  value: number | null | undefined;
  currency: string;
}) {
  if (value == null) return <EmptyCell />;
  const fmt = getCurrencyFormatter(currency);
  return (
    <span className="text-xs font-semibold tabular-nums">
      {fmt.format(value)}
    </span>
  );
}

export function createFacturasColumns(
  onViewDetail: (factura: FacturaDto) => void,
): ColumnDef<FacturaDto>[] {
  return [
    // ─── Selección ───────────────────────────────────────────────────────
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

    // ─── Concepto ────────────────────────────────────────────────────────
    {
      accessorKey: "concepto",
      header: "Concepto",
      cell: ({ row }) => {
        const concepto = row.getValue("concepto") as string;
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm font-medium truncate max-w-[200px] block">
                {concepto}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-[320px]">{concepto}</p>
            </TooltipContent>
          </Tooltip>
        );
      },
      size: 22,
    },

    // ─── UUID ─────────────────────────────────────────────────────────────
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

    // ─── Serie ────────────────────────────────────────────────────────────
    {
      accessorKey: "serie",
      header: "Serie",
      cell: ({ row }) => (
        <TextCell value={row.getValue("serie")} maxWidth={80} />
      ),
      size: 8,
    },

    // ─── Folio ────────────────────────────────────────────────────────────
    {
      accessorKey: "folio",
      header: "Folio",
      cell: ({ row }) => (
        <TextCell value={row.getValue("folio")} maxWidth={80} />
      ),
      size: 8,
    },

    // ─── RFC Emisor ───────────────────────────────────────────────────────
    {
      accessorKey: "rfcEmisor",
      header: "RFC Emisor",
      cell: ({ row }) => (
        <TextCell value={row.getValue("rfcEmisor")} mono maxWidth={130} />
      ),
      size: 12,
    },

    // ─── Nombre Emisor ────────────────────────────────────────────────────
    {
      accessorKey: "nombreEmisor",
      header: "Nom Emisor",
      cell: ({ row }) => (
        <TextCell value={row.getValue("nombreEmisor")} maxWidth={160} />
      ),
      size: 16,
    },

    // ─── RFC Receptor ─────────────────────────────────────────────────────
    {
      accessorKey: "rfcReceptor",
      header: "RFC Receptor",
      cell: ({ row }) => (
        <TextCell value={row.getValue("rfcReceptor")} mono maxWidth={130} />
      ),
      size: 12,
    },

    // ─── Nombre Receptor ──────────────────────────────────────────────────
    {
      accessorKey: "nombreReceptor",
      header: "Nom Receptor",
      cell: ({ row }) => (
        <TextCell value={row.getValue("nombreReceptor")} maxWidth={160} />
      ),
      size: 16,
    },

    // ─── Subtotal ─────────────────────────────────────────────────────────
    {
      accessorKey: "subtotal",
      header: "Subtotal",
      cell: ({ row }) => (
        <AmountCell
          value={row.getValue("subtotal")}
          currency={row.original.moneda}
        />
      ),
      size: 12,
    },

    // ─── Total ────────────────────────────────────────────────────────────
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => {
        const total = row.getValue("total") as number;
        const fmt = getCurrencyFormatter(row.original.moneda);
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-foreground text-sm">
              {fmt.format(total)}
            </span>
            <Badge variant="outline" className="font-mono text-xs w-fit">
              {row.original.moneda}
            </Badge>
          </div>
        );
      },
      size: 12,
    },

    // ─── Imp. Trasladados ─────────────────────────────────────────────────
    {
      accessorKey: "totalImpuestosTransladados",
      header: "Imp. Trasladados",
      cell: ({ row }) => (
        <AmountCell
          value={row.getValue("totalImpuestosTransladados")}
          currency={row.original.moneda}
        />
      ),
      size: 14,
    },

    // ─── Imp. Retenidos ───────────────────────────────────────────────────
    {
      accessorKey: "totalImpuestosRetenidos",
      header: "Imp. Retenidos",
      cell: ({ row }) => (
        <AmountCell
          value={row.getValue("totalImpuestosRetenidos")}
          currency={row.original.moneda}
        />
      ),
      size: 14,
    },

    // ─── Moneda ───────────────────────────────────────────────────────────
    {
      accessorKey: "moneda",
      header: "Moneda",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs">
          {row.getValue("moneda")}
        </Badge>
      ),
      size: 8,
    },

    // ─── Método de Pago ───────────────────────────────────────────────────
    {
      accessorKey: "metodoPago",
      header: "Método Pago",
      cell: ({ row }) => (
        <TextCell value={row.getValue("metodoPago")} maxWidth={100} />
      ),
      size: 10,
    },

    // ─── Uso CFDI ─────────────────────────────────────────────────────────
    {
      accessorKey: "usoCfdi",
      header: "Uso CFDI",
      cell: ({ row }) => (
        <TextCell value={row.getValue("usoCfdi")} maxWidth={120} />
      ),
      size: 10,
    },

    // ─── Status ───────────────────────────────────────────────────────────
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <FacturaStatusBadge status={status} />;
      },
      size: 10,
    },

    // ─── Status Pago ──────────────────────────────────────────────────────
    {
      accessorKey: "statusPago",
      header: "Status Pago",
      cell: ({ row }) => {
        const statusPago = row.getValue("statusPago") as string | null;
        if (!statusPago) return <EmptyCell />;
        return (
          <Badge
            variant="secondary"
            className={cn("border-0 rounded-xs", statusPagoColors[statusPago])}
          >
            {statusPagoLabels[statusPago] ?? statusPago}
          </Badge>
        );
      },
      size: 10,
    },

    // ─── Fecha Pago ───────────────────────────────────────────────────────
    {
      accessorKey: "fechaPago",
      header: "Fecha Pago",
      cell: ({ row }) => {
        const fechaPago = row.getValue("fechaPago") as string | null;
        if (!fechaPago) return <EmptyCell />;
        return <div className="text-xs">{formatDate(fechaPago)}</div>;
      },
      size: 10,
    },

    // ─── Ingresado Por ────────────────────────────────────────────────────
    {
      accessorKey: "ingresadoPorNombre",
      header: "Ingresado Por",
      cell: ({ row }) => (
        <TextCell value={row.getValue("ingresadoPorNombre")} maxWidth={140} />
      ),
      size: 14,
    },

    // ─── Fecha Registro ───────────────────────────────────────────────────
    {
      accessorKey: "createdAt",
      header: "Fecha Registro",
      cell: ({ row }) => {
        const fecha = row.getValue("createdAt") as string;
        return <div className="text-xs">{formatDate(fecha)}</div>;
      },
      size: 10,
    },

    // ─── Última Actualización ─────────────────────────────────────────────
    {
      accessorKey: "updatedAt",
      header: "Actualización",
      cell: ({ row }) => {
        const fecha = row.getValue("updatedAt") as string;
        return <div className="text-xs">{formatDateTime(fecha)}</div>;
      },
      size: 12,
    },

    // ─── Acciones ─────────────────────────────────────────────────────────
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
