"use client";
import { EllipsisIcon, FileTextIcon, DownloadIcon } from "lucide-react";
import { Button } from "@/core/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/core/shared/ui/dropdown-menu";
import { Badge } from "@/core/shared/ui/badge";
import { cn } from "@/core/lib/utils";

import { ColumnDef, Row } from "@tanstack/react-table";
import { Factura } from "../types/Factura.type";

export const FacturasColumns: ColumnDef<Factura>[] = [
  {
    header: "ID",
    accessorKey: "id",
    cell: ({ row }) => (
      <div className="font-mono text-sm font-medium truncate">
        {row.getValue("id")}
      </div>
    ),
    size: 8,
  },
  {
    header: "Tipo",
    accessorKey: "tipoOrigen",
    cell: ({ row }) => {
      const tipo = row.getValue("tipoOrigen") as string;
      return (
        <Badge
          variant={tipo === "ingreso" ? "default" : "secondary"}
          className={cn(
            "text-xs",
            tipo === "ingreso"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800",
          )}
        >
          {tipo === "ingreso" ? "Ingreso" : "Egreso"}
        </Badge>
      );
    },
    size: 8,
  },
  {
    header: "Cliente/Proveedor",
    accessorKey: "clienteProveedor",
    cell: ({ row }) => (
      <div className="text-sm truncate max-w-[200px]">
        {row.getValue("clienteProveedor")}
      </div>
    ),
    size: 20,
  },
  {
    header: "Concepto",
    accessorKey: "concepto",
    cell: ({ row }) => (
      <div className="font-medium truncate max-w-[300px]">
        {row.getValue("concepto")}
      </div>
    ),
    size: 30,
  },
  {
    header: "Número Factura",
    accessorKey: "numeroFactura",
    cell: ({ row }) => (
      <div className="text-sm font-mono truncate">
        {row.getValue("numeroFactura")}
      </div>
    ),
    size: 12,
  },
  {
    header: "Folio Fiscal",
    accessorKey: "folioFiscal",
    cell: ({ row }) => (
      <div className="text-sm font-mono truncate">
        {row.getValue("folioFiscal")}
      </div>
    ),
    size: 10,
  },
  {
    header: "Monto",
    accessorKey: "monto",
    cell: ({ row }) => {
      const monto = parseFloat(row.getValue("monto"));
      const tipo = row.original.tipoOrigen;
      const formatted = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(monto);

      return (
        <div
          className={cn(
            "font-medium truncate",
            tipo === "ingreso" ? "text-green-600" : "text-red-600",
          )}
        >
          {formatted}
        </div>
      );
    },
    size: 15,
  },
  {
    header: "Estado",
    accessorKey: "estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado") as string;
      return (
        <Badge
          variant={estado === "Pagada" ? "default" : "secondary"}
          className={cn(
            "text-xs",
            estado === "Pagada"
              ? "bg-green-100 text-green-800"
              : estado === "Enviada"
                ? "bg-blue-100 text-blue-800"
                : estado === "Borrador"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-red-100 text-red-800",
          )}
        >
          {estado}
        </Badge>
      );
    },
    size: 10,
  },
  {
    header: "Fecha Emisión",
    accessorKey: "fechaEmision",
    cell: ({ row }) => {
      const fecha = row.getValue("fechaEmision") as string;
      return (
        <div className="text-sm truncate">
          {new Date(fecha).toLocaleDateString("es-MX")}
        </div>
      );
    },
    size: 12,
  },
  {
    header: "Fecha Vencimiento",
    accessorKey: "fechaVencimiento",
    cell: ({ row }) => {
      const fecha = row.getValue("fechaVencimiento") as string;
      return (
        <div className="text-sm truncate">
          {new Date(fecha).toLocaleDateString("es-MX")}
        </div>
      );
    },
    size: 12,
  },
  {
    header: "Fecha Pago",
    accessorKey: "fechaPago",
    cell: ({ row }) => {
      const fechaPago = row.getValue("fechaPago") as string;
      return fechaPago ? (
        <div className="text-sm truncate">
          {new Date(fechaPago).toLocaleDateString("es-MX")}
        </div>
      ) : (
        <span className="text-gray-400 text-xs">-</span>
      );
    },
    size: 12,
  },
  {
    header: "Forma de Pago",
    accessorKey: "formaPago",
    cell: ({ row }) => {
      const formaPago = row.getValue("formaPago") as string;
      return (
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            formaPago === "Transferencia"
              ? "bg-blue-100 text-blue-800"
              : formaPago === "Efectivo"
                ? "bg-green-100 text-green-800"
                : "bg-orange-100 text-orange-800",
          )}
        >
          {formaPago}
        </Badge>
      );
    },
    size: 12,
  },
  {
    header: "Creado Por",
    accessorKey: "creadoPor",
    cell: ({ row }) => (
      <div className="text-sm truncate">{row.getValue("creadoPor")}</div>
    ),
    size: 10,
  },
  {
    header: "Archivos",
    accessorKey: "archivoPdf",
    cell: ({ row }) => {
      const archivoPdf = row.getValue("archivoPdf") as string;
      const archivoXml = row.original.archivoXml;

      return (
        <div className="flex gap-1">
          {archivoPdf && (
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <FileTextIcon className="h-3 w-3" />
            </Button>
          )}
          {archivoXml && (
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <DownloadIcon className="h-3 w-3" />
            </Button>
          )}
        </div>
      );
    },
    size: 8,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => <RowActions row={row} />,
    size: 5,
    enableHiding: false,
  },
];

function RowActions({ row }: { row: Row<Factura> }) {
  const estado = row.getValue("estado") as string;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
          <EllipsisIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Editar</DropdownMenuItem>
        <DropdownMenuItem>Ver detalles</DropdownMenuItem>
        <DropdownMenuItem>Ver origen</DropdownMenuItem>
        <DropdownMenuItem>Descargar PDF</DropdownMenuItem>
        <DropdownMenuItem>Descargar XML</DropdownMenuItem>
        {estado === "Enviada" && (
          <DropdownMenuItem>Marcar como pagada</DropdownMenuItem>
        )}
        {estado === "Borrador" && (
          <DropdownMenuItem>Enviar factura</DropdownMenuItem>
        )}
        <DropdownMenuItem className="text-red-600">Cancelar</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
