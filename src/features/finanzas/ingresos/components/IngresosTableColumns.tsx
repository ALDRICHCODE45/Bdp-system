"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/core/shared/ui/checkbox";
import { Badge } from "@/core/shared/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/core/shared/ui/tooltip";
import { IngresoDto } from "../server/dtos/IngresoDto.dto";
import { IngresoRowActions } from "./forms/IngresoRowActions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/shared/ui/popover";
import { FileText } from "lucide-react";
import { Button } from "@/core/shared/ui/button";

export const columns: ColumnDef<IngresoDto>[] = [
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
    accessorKey: "concepto",
    header: "Concepto",
    cell: ({ row }) => {
      const concepto = row.getValue("concepto") as string;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[200px] truncate font-medium">
                {concepto}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{concepto}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: true,
    size: 17,
  },
  {
    accessorKey: "cliente",
    header: "Cliente",
    cell: ({ row }) => {
      const ingreso = row.original;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[150px] truncate">{ingreso.cliente}</div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-semibold">{ingreso.cliente}</p>
                {ingreso.clienteInfo && (
                  <>
                    <p className="text-xs">RFC: {ingreso.clienteInfo.rfc}</p>
                  </>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    size: 12,
  },
  {
    accessorKey: "solicitante",
    header: "Solicitante",
    cell: ({ row }) => {
      const solicitante = row.getValue("solicitante") as string;
      return (
        <Badge variant="outline" className="uppercase">
          {solicitante}
        </Badge>
      );
    },
    size: 17,
  },
  {
    accessorKey: "autorizador",
    header: "Autorizador",
    cell: ({ row }) => {
      const autorizador = row.getValue("autorizador") as string;
      return (
        <Badge variant="outline" className="uppercase">
          {autorizador}
        </Badge>
      );
    },
    size: 17,
  },
  {
    accessorKey: "numeroFactura",
    header: "No. Factura",
    cell: ({ row }) => {
      const numeroFactura = row.getValue("numeroFactura") as string;
      return <div className="font-mono text-sm">{numeroFactura}</div>;
    },
    size: 17,
  },
  {
    accessorKey: "folioFiscal",
    header: "Folio Fiscal",
    cell: ({ row }) => {
      const folioFiscal = row.getValue("folioFiscal") as string;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[120px] truncate font-mono text-xs">
                {folioFiscal}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-mono text-xs">{folioFiscal}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    size: 17,
  },
  {
    accessorKey: "periodo",
    header: "Periodo",
    cell: ({ row }) => {
      const periodo = row.getValue("periodo") as string;
      return <div className="text-sm">{periodo}</div>;
    },
    enableSorting: true,
    size: 17,
  },
  {
    accessorKey: "formaPago",
    header: "Forma de Pago",
    cell: ({ row }) => {
      const formaPago = row.getValue("formaPago") as string;
      const colors = {
        transferencia:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        efectivo:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        cheque:
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      };
      return (
        <Badge
          variant="outline"
          className={colors[formaPago as keyof typeof colors]}
        >
          {formaPago.charAt(0).toUpperCase() + formaPago.slice(1)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    size: 17,
  },
  {
    accessorKey: "cantidad",
    header: "Cantidad",
    cell: ({ row }) => {
      const cantidad = row.getValue("cantidad") as number;
      const formatted = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(cantidad);
      return <div className="font-semibold text-green-600">{formatted}</div>;
    },
    enableSorting: true,
    filterFn: (row, id, value: { min?: number; max?: number }) => {
      const cantidad = row.getValue(id) as number;
      if (value.min !== undefined && cantidad < value.min) return false;
      if (value.max !== undefined && cantidad > value.max) return false;
      return true;
    },
    size: 17,
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado") as string;
      const colors = {
        pagado:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        pendiente:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        cancelado: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      };
      return (
        <Badge className={colors[estado as keyof typeof colors]}>
          {estado.charAt(0).toUpperCase() + estado.slice(1)}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    size: 17,
  },
  {
    accessorKey: "fechaPago",
    header: "Fecha de Pago",
    cell: ({ row }) => {
      const fechaPago = row.getValue("fechaPago") as string | null;
      if (!fechaPago) return <span className="text-muted-foreground">-</span>;
      return (
        <div className="text-sm">
          {new Date(fechaPago).toLocaleDateString("es-MX")}
        </div>
      );
    },
    enableSorting: true,
    filterFn: (row, id, value) => {
      const date = row.getValue(id) as string | null;
      if (!date || !value) return true;
      const rowDate = new Date(date);
      const { from, to } = value;
      if (from && rowDate < from) return false;
      if (to && rowDate > to) return false;
      return true;
    },

    size: 17,
  },
  {
    accessorKey: "fechaRegistro",
    header: "Fecha Registro",
    cell: ({ row }) => {
      const fechaRegistro = row.getValue("fechaRegistro") as string;
      return (
        <div className="text-sm">
          {new Date(fechaRegistro).toLocaleDateString("es-MX")}
        </div>
      );
    },
    enableSorting: true,
    size: 17,
  },
  {
    accessorKey: "facturadoPor",
    header: "Facturado Por",
    cell: ({ row }) => {
      const facturadoPor = row.getValue("facturadoPor") as string;
      return (
        <Badge variant="secondary" className="uppercase font-mono text-xs">
          {facturadoPor}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    size: 17,
  },
  {
    accessorKey: "clienteProyecto",
    header: "Proyecto",
    cell: ({ row }) => {
      const clienteProyecto = row.getValue("clienteProyecto") as string;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[120px] truncate font-mono text-xs">
                {clienteProyecto}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-mono text-xs">{clienteProyecto}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    size: 17,
  },
  {
    accessorKey: "fechaParticipacion",
    header: "Fecha Participación",
    cell: ({ row }) => {
      const fechaParticipacion = row.getValue("fechaParticipacion") as
        | string
        | null;
      if (!fechaParticipacion)
        return <span className="text-muted-foreground">-</span>;
      return (
        <div className="text-sm">
          {new Date(fechaParticipacion).toLocaleDateString("es-MX")}
        </div>
      );
    },
    size: 17,
  },
  {
    accessorKey: "notas",
    header: "Notas",
    cell: ({ row }) => {
      const notas = row.getValue("notas") as string | null;
      if (!notas) return <span className="text-muted-foreground">-</span>;
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <FileText className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-semibold">Notas</h4>
              <p className="text-sm text-muted-foreground">{notas}</p>
            </div>
          </PopoverContent>
        </Popover>
      );
    },
    size: 8,
  },
  {
    id: "actions",
    cell: ({ row }) => <IngresoRowActions row={row} />,
    enableHiding: false,
    size: 4,
    minSize: 4,
    maxSize: 4,
  },
];
