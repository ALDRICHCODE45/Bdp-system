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
import { FacturaDto } from "../server/dtos/FacturaDto.dto";
import { FacturaRowActions } from "./forms/FacturaRowActions";
import { ViewNotesColumn } from "./columns/ViewNotesColumn";
import { ViewAddressColumn } from "./columns/ViewAddressColumn";
import { UploadFacturaColumn } from "./columns/UploadFacturaColumn";

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
    accessorKey: "numeroFactura",
    header: "No. Factura",
    cell: ({ row }) => {
      const numeroFactura = row.getValue("numeroFactura") as string;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild className="flex justify-center">
              <div className="max-w-[100px] truncate font-mono text-sm">
                {numeroFactura}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-mono text-xs">{numeroFactura}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    size: 10,
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
              <div className="max-w-[120px] truncate font-mono text-sm">
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
    size: 10,
  },
  {
    accessorKey: "clienteProveedor",
    header: "Cliente/Proveedor",
    cell: ({ row }) => {
      const nombre = row.getValue("clienteProveedor") as string;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild className="flex justify-center">
              <div className="max-w-[150px] truncate">{nombre}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{nombre}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    size: 10,
    filterFn: (row, id, value: string) => {
      if (!value) return true;
      const nombre = (row.getValue(id) as string).toLowerCase();
      return nombre.includes(value.toLowerCase());
    },
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
              <div className="max-w-[200px] truncate">{concepto}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{concepto}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    size: 15,
  },
  {
    accessorKey: "monto",
    header: "Monto",
    cell: ({ row }) => {
      const monto = row.getValue("monto") as number;
      const formatted = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(monto);
      return <div className="font-medium">{formatted}</div>;
    },
    size: 10,
    filterFn: (row, id, value: { min?: number; max?: number }) => {
      const monto = row.getValue(id) as number;
      if (value.min !== undefined && monto < value.min) return false;
      if (value.max !== undefined && monto > value.max) return false;
      return true;
    },
  },
  {
    accessorKey: "periodo",
    header: "Período",
    cell: ({ row }) => {
      const periodo = row.getValue("periodo") as string;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[80px] truncate font-mono text-xs">
                {periodo}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-mono text-xs">{periodo}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    size: 7,
    filterFn: (row, id, value) => {
      if (!value || value === "todos") return true;
      return row.getValue(id) === value;
    },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado") as
        | "borrador"
        | "enviada"
        | "pagada"
        | "cancelada";
      const variants: Record<
        typeof estado,
        "default" | "secondary" | "destructive" | "outline"
      > = {
        borrador: "secondary",
        enviada: "default",
        pagada: "outline",
        cancelada: "destructive",
      };
      return (
        <Badge variant={variants[estado]}>
          {estado.charAt(0).toUpperCase() + estado.slice(1)}
        </Badge>
      );
    },
    size: 8,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "tipoOrigen",
    header: "Tipo Origen",
    cell: ({ row }) => {
      const tipoOrigen = row.getValue("tipoOrigen") as "ingreso" | "egreso" | null;
      
      if (!tipoOrigen) {
        return (
          <Badge variant="secondary">
            Sin vincular
          </Badge>
        );
      }
      
      const variant = tipoOrigen === "ingreso" ? "outline" : "destructive";
      return (
        <Badge variant={variant}>
          {tipoOrigen.charAt(0).toUpperCase() + tipoOrigen.slice(1)}
        </Badge>
      );
    },
    size: 8,
    filterFn: (row, id, value) => {
      const tipoOrigen = row.getValue(id);
      if (tipoOrigen === null && value.includes("sin_vincular")) {
        return true;
      }
      return value.includes(tipoOrigen);
    },
  },
  {
    accessorKey: "fechaEmision",
    header: "Fecha Emisión",
    cell: ({ row }) => {
      const fecha = row.getValue("fechaEmision") as string;
      const formatted = new Intl.DateTimeFormat("es-MX", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(fecha));
      return <div className="text-xs">{formatted}</div>;
    },
    size: 9,
    filterFn: (row, id, value) => {
      const rowDate = new Date(row.getValue(id) as string);
      const fromDate = value?.from ? new Date(value.from) : null;
      const toDate = value?.to ? new Date(value.to) : null;

      if (fromDate && toDate) {
        return rowDate >= fromDate && rowDate <= toDate;
      }
      if (fromDate) {
        return rowDate >= fromDate;
      }
      if (toDate) {
        return rowDate <= toDate;
      }
      return true;
    },
  },
  {
    accessorKey: "fechaVencimiento",
    header: "Fecha Vencimiento",
    cell: ({ row }) => {
      const fecha = row.getValue("fechaVencimiento") as string;
      const formatted = new Intl.DateTimeFormat("es-MX", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(fecha));
      return <div className="text-xs">{formatted}</div>;
    },
    size: 9,
  },
  {
    accessorKey: "fechaPago",
    header: "Fecha Pago",
    cell: ({ row }) => {
      const fecha = row.getValue("fechaPago") as string | undefined;
      if (!fecha) return <div className="text-xs text-muted-foreground">-</div>;
      const formatted = new Intl.DateTimeFormat("es-MX", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(fecha));
      return <div className="text-xs">{formatted}</div>;
    },
    size: 9,
  },
  {
    accessorKey: "formaPago",
    header: "Forma de Pago",
    cell: ({ row }) => {
      const formaPago = row.getValue("formaPago") as string;
      return (
        <div className="text-xs">
          {formaPago.charAt(0).toUpperCase() + formaPago.slice(1)}
        </div>
      );
    },
    size: 10,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "rfcEmisor",
    header: "RFC Emisor",
    cell: ({ row }) => {
      const rfc = row.getValue("rfcEmisor") as string;
      return (
        <TooltipProvider>
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
        </TooltipProvider>
      );
    },
    size: 9,
    filterFn: (row, id, value: string) => {
      if (!value) return true;
      const rfc = (row.getValue(id) as string).toLowerCase();
      return rfc.includes(value.toLowerCase());
    },
  },
  {
    accessorKey: "rfcReceptor",
    header: "RFC Receptor",
    cell: ({ row }) => {
      const rfc = row.getValue("rfcReceptor") as string;
      return (
        <TooltipProvider>
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
        </TooltipProvider>
      );
    },
    size: 9,
  },
  {
    accessorKey: "direccionEmisor",
    header: "Dirección Emisor",
    cell: ({ row }) => {
      const direccion = row.getValue("direccionEmisor") as string;
      return (
        <div className="w-full flex justify-center">
          <ViewAddressColumn address={direccion} />
        </div>
      );
    },
    size: 12,
  },
  {
    accessorKey: "direccionReceptor",
    header: "Dirección Receptor",
    cell: ({ row }) => {
      const direccion = row.getValue("direccionReceptor") as string;
      return (
        <div className="w-full flex justify-center">
          <ViewAddressColumn address={direccion} />
        </div>
      );
    },
    size: 12,
  },
  {
    accessorKey: "fechaRegistro",
    header: "Fecha Registro",
    cell: ({ row }) => {
      const fecha = row.getValue("fechaRegistro") as string;
      const formatted = new Intl.DateTimeFormat("es-MX", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(new Date(fecha));
      return <div className="text-xs">{formatted}</div>;
    },
    size: 9,
  },
  {
    accessorKey: "creadoPorNombre",
    header: "Creado Por",
    cell: ({ row }) => {
      const creador = row.getValue("creadoPorNombre") as string | null;
      if (!creador) {
        return <div className="text-xs text-muted-foreground">-</div>;
      }
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[100px] truncate text-xs">{creador}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{creador}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    size: 9,
    filterFn: (row, id, value: string) => {
      if (!value) return true;
      const creador = (row.getValue(id) as string | null)?.toLowerCase() || "";
      return creador.includes(value.toLowerCase());
    },
  },
  {
    accessorKey: "autorizadoPorNombre",
    header: "Autorizado Por",
    cell: ({ row }) => {
      const autorizador = row.getValue("autorizadoPorNombre") as string | null;
      if (!autorizador) {
        return <div className="text-xs text-muted-foreground">-</div>;
      }
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[100px] truncate text-xs">
                {autorizador}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{autorizador}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    size: 9,
  },
  {
    accessorKey: "notas",
    header: () => (
      <div className="flex justify-end items-center w-full h-full">Notas</div>
    ),
    cell: ({ row }) => {
      const notas = row.getValue("notas") as string | undefined;
      if (!notas)
        return <div className="text-xs text-muted-foreground">N/A</div>;
      return (
        <div className="w-full flex justify-start">
          <ViewNotesColumn column={row} />
        </div>
      );
    },
    size: 9,
  },
  {
    header: "Número de Cuenta",
    accessorKey: "numeroCuenta",
    cell: ({ row }) => {
      const numeroCuenta = row.getValue("numeroCuenta") as string;
      return <div className="text-sm font-mono truncate">{numeroCuenta}</div>;
    },
    size: 15,
  },
  {
    header: "CLABE",
    accessorKey: "clabe",
    cell: ({ row }) => {
      const clabe = row.getValue("clabe") as string;
      return <div className="text-sm font-mono truncate">{clabe}</div>;
    },
    size: 15,
  },
  {
    header: "Banco",
    accessorKey: "banco",
    cell: ({ row }) => {
      const banco = row.getValue("banco") as string;
      return <div className="text-sm truncate">{banco}</div>;
    },
    size: 12,
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
