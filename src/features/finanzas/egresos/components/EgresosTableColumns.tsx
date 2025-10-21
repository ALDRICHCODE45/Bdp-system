"use client";
import { EllipsisIcon } from "lucide-react";
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
import { Egreso } from "../types/Egreso.type";

export const EgresosColumns: ColumnDef<Egreso>[] = [
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
    header: "Clasificación",
    accessorKey: "clasificacion",
    cell: ({ row }) => {
      const clasificacion = row.getValue("clasificacion") as string;
      return (
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            clasificacion === "Gasto Op"
              ? "bg-blue-100 text-blue-800"
              : clasificacion === "Honorarios"
              ? "bg-green-100 text-green-800"
              : clasificacion === "Servicios"
              ? "bg-purple-100 text-purple-800"
              : clasificacion === "Arrendamiento"
              ? "bg-orange-100 text-orange-800"
              : clasificacion === "Comisiones"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          )}
        >
          {clasificacion}
        </Badge>
      );
    },
    size: 12,
  },
  {
    header: "Categoría",
    accessorKey: "categoria",
    cell: ({ row }) => {
      const categoria = row.getValue("categoria") as string;
      return (
        <Badge
          variant="secondary"
          className={cn(
            "text-xs",
            categoria === "Facturación"
              ? "bg-green-100 text-green-800"
              : categoria === "Comisiones"
              ? "bg-yellow-100 text-yellow-800"
              : categoria === "Disposición"
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          )}
        >
          {categoria}
        </Badge>
      );
    },
    size: 12,
  },
  {
    header: "Proveedor",
    accessorKey: "proveedor",
    cell: ({ row }) => (
      <div className="text-sm truncate">{row.getValue("proveedor")}</div>
    ),
    size: 20,
  },
  {
    header: "Factura",
    accessorKey: "numeroFactura",
    cell: ({ row }) => (
      <div className="text-sm font-mono truncate">
        {row.getValue("numeroFactura")}
      </div>
    ),
    size: 10,
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
    header: "Período",
    accessorKey: "periodo",
    cell: ({ row }) => (
      <div className="text-sm truncate">{row.getValue("periodo")}</div>
    ),
    size: 10,
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
              : "bg-orange-100 text-orange-800"
          )}
        >
          {formaPago}
        </Badge>
      );
    },
    size: 12,
  },
  {
    header: "Cantidad",
    accessorKey: "cantidad",
    cell: ({ row }) => {
      const cantidad = parseFloat(row.getValue("cantidad"));
      const formatted = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
      }).format(cantidad);

      return (
        <div className="font-medium text-red-600 truncate">{formatted}</div>
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
          variant={estado === "Pagado" ? "default" : "secondary"}
          className={cn(
            "text-xs",
            estado === "Pagado"
              ? "bg-green-100 text-green-800"
              : estado === "Pendiente"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          )}
        >
          {estado}
        </Badge>
      );
    },
    size: 10,
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
    header: "Solicitante",
    accessorKey: "solicitante",
    cell: ({ row }) => (
      <div className="text-sm truncate">{row.getValue("solicitante")}</div>
    ),
    size: 10,
  },
  {
    header: "Autorizador",
    accessorKey: "autorizador",
    cell: ({ row }) => (
      <div className="text-sm truncate">{row.getValue("autorizador")}</div>
    ),
    size: 10,
  },
  {
    header: "Facturado Por",
    accessorKey: "facturadoPor",
    cell: ({ row }) => (
      <div className="text-sm truncate">{row.getValue("facturadoPor")}</div>
    ),
    size: 12,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => <RowActions row={row} />,
    size: 5,
    enableHiding: false,
  },
];

function RowActions({ row: _row }: { row: Row<Egreso> }) {
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
        <DropdownMenuItem>Ver factura</DropdownMenuItem>
        <DropdownMenuItem>Marcar como pagado</DropdownMenuItem>
        <DropdownMenuItem className="text-red-600">Cancelar</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
