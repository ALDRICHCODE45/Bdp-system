"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/core/shared/ui/checkbox";
import { Badge } from "@/core/shared/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/shared/ui/tooltip";
import { FacturaDto } from "../server/dtos/FacturaDto.dto";
import { FacturaRowActions } from "./forms/FacturaRowActions";
import { UploadFacturaColumn } from "./columns/UploadFacturaColumn";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export const columns: ColumnDef<FacturaDto>[] = [
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
    size: 4,
    minSize: 4,
    maxSize: 4,
  },
  {
    accessorKey: "serie",
    header: "Serie",
    cell: ({ row }) => {
      const serie = row.getValue("serie") as string | null;
      if (!serie) return <div className="text-xs text-muted-foreground">-</div>;
      return <div className="font-mono text-sm">{serie}</div>;
    },
    size: 6,
  },
  {
    accessorKey: "folio",
    header: "Folio",
    cell: ({ row }) => {
      const folio = row.getValue("folio") as string | null;
      if (!folio) return <div className="text-xs text-muted-foreground">-</div>;
      return <div className="font-mono text-sm">{folio}</div>;
    },
    size: 6,
  },
  {
    accessorKey: "nombreReceptor",
    header: "Nombre Receptor",
    cell: ({ row }) => {
      const nombre = row.getValue("nombreReceptor") as string | null;
      if (!nombre)
        return <div className="text-xs text-muted-foreground">-</div>;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="max-w-[120px] truncate text-xs">{nombre}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{nombre}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    size: 10,
  },
  {
    accessorKey: "rfcReceptor",
    header: "RFC Receptor",
    cell: ({ row }) => {
      const rfc = row.getValue("rfcReceptor") as string;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="max-w-[100px] truncate font-mono text-xs">
              {rfc}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-mono text-xs">{rfc}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    size: 9,
  },
  {
    accessorKey: "concepto",
    header: "Concepto",
    cell: ({ row }) => {
      const concepto = row.getValue("concepto") as string;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="max-w-[200px] truncate">{concepto}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{concepto}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    size: 15,
  },
  {
    accessorKey: "subtotal",
    header: "Subtotal",
    cell: ({ row }) => {
      const subtotal = row.getValue("subtotal") as number;
      return (
        <div className="font-medium">{currencyFormatter.format(subtotal)}</div>
      );
    },
    size: 10,
  },
  {
    accessorKey: "totalImpuestosTransladados",
    header: "Imp. Trasladados",
    cell: ({ row }) => {
      const value = row.getValue("totalImpuestosTransladados") as number | null;
      if (value === null)
        return <div className="text-xs text-muted-foreground">-</div>;
      return (
        <div className="font-medium">{currencyFormatter.format(value)}</div>
      );
    },
    size: 10,
  },

  {
    accessorKey: "totalImpuestosRetenidos",
    header: "Imp. Retenidos",
    cell: ({ row }) => {
      const value = row.getValue("totalImpuestosRetenidos") as number | null;
      if (value === null)
        return <div className="text-xs text-muted-foreground">-</div>;
      return (
        <div className="font-medium">{currencyFormatter.format(value)}</div>
      );
    },
    size: 10,
  },

  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const total = row.getValue("total") as number;
      return (
        <div className="font-medium">{currencyFormatter.format(total)}</div>
      );
    },
    size: 10,
  },
  {
    accessorKey: "uuid",
    header: "UUID",
    cell: ({ row }) => {
      const uuid = row.getValue("uuid") as string;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="max-w-[120px] truncate font-mono text-sm">
              {uuid}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-mono text-xs">{uuid}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    size: 10,
  },
  {
    accessorKey: "metodoPago",
    header: "Método Pago",
    cell: ({ row }) => {
      const metodoPago = row.getValue("metodoPago") as string | null;
      if (!metodoPago)
        return <div className="text-xs text-muted-foreground">-</div>;
      return <div className="text-xs">{metodoPago}</div>;
    },
    size: 8,
  },
  {
    accessorKey: "moneda",
    header: "Moneda",
    cell: ({ row }) => {
      const moneda = row.getValue("moneda") as string;
      return <div className="font-mono text-xs">{moneda}</div>;
    },
    size: 6,
  },

  {
    accessorKey: "usoCfdi",
    header: "Uso CFDI",
    cell: ({ row }) => {
      const usoCfdi = row.getValue("usoCfdi") as string | null;
      if (!usoCfdi)
        return <div className="text-xs text-muted-foreground">-</div>;
      return <div className="text-xs">{usoCfdi}</div>;
    },
    size: 7,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as
        | "borrador"
        | "enviada"
        | "pagada"
        | "cancelada";
      const variants: Record<
        typeof status,
        "default" | "secondary" | "destructive" | "outline"
      > = {
        borrador: "secondary",
        enviada: "default",
        pagada: "outline",
        cancelada: "destructive",
      };
      return (
        <Badge variant={variants[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
    size: 8,
  },
  {
    accessorKey: "nombreEmisor",
    header: "Nombre Emisor",
    cell: ({ row }) => {
      const nombre = row.getValue("nombreEmisor") as string | null;
      if (!nombre)
        return <div className="text-xs text-muted-foreground">-</div>;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="max-w-[120px] truncate text-xs">{nombre}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{nombre}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    size: 10,
  },
  {
    accessorKey: "rfcEmisor",
    header: "RFC Emisor",
    cell: ({ row }) => {
      const rfc = row.getValue("rfcEmisor") as string;
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="max-w-[100px] truncate font-mono text-xs">
              {rfc}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-mono text-xs">{rfc}</p>
          </TooltipContent>
        </Tooltip>
      );
    },
    size: 9,
  },
  {
    accessorKey: "statusPago",
    header: "Status Pago",
    cell: ({ row }) => {
      const statusPago = row.getValue("statusPago") as string | null;
      if (!statusPago)
        return <div className="text-xs text-muted-foreground">-</div>;
      return <div className="text-xs">{statusPago}</div>;
    },
    size: 8,
  },
  {
    accessorKey: "fechaPago",
    header: "Fecha Pago",
    cell: ({ row }) => {
      const fecha = row.getValue("fechaPago") as string | null;
      if (!fecha) return <div className="text-xs text-muted-foreground">-</div>;
      const formatted = dateFormatter.format(new Date(fecha));
      return <div className="text-xs">{formatted}</div>;
    },
    size: 9,
  },

  {
    header: "Ingresado Por",
    accessorKey: "ingresadoPorNombre",
    cell: ({ row }) => {
      const ingresadoPorNombre = row.getValue("ingresadoPorNombre") as
        | string
        | null;
      return (
        <div className="text-sm truncate">
          {ingresadoPorNombre || <span className="text-gray-400">N/A</span>}
        </div>
      );
    },
    size: 15,
  },

  {
    id: "archivos",
    header: "Archivos",
    cell: ({ row }) => {
      const factura = row.original;
      return <UploadFacturaColumn facturaId={factura.id} />;
    },
    size: 9,
  },

  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => <FacturaRowActions row={row} />,
    enableHiding: false,
    size: 4,
    minSize: 4,
    maxSize: 4,
  },
];
