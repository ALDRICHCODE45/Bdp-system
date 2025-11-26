"use client";
import { Badge } from "@/core/shared/ui/badge";
import { cn } from "@/core/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { EgresoDto } from "../server/dtos/EgresoDto.dto";
import { EgresoRowActions } from "./forms/EgresoRowActions";
import { Checkbox } from "@/core/shared/ui/checkbox";
import { UploadEgresoColumn } from "./columns/UploadEgresoColumn";

export const columns: ColumnDef<EgresoDto>[] = [
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
      const clasificacionCapitalized =
        clasificacion.charAt(0).toUpperCase() + clasificacion.slice(1);
      return (
        <Badge
          variant="outline"
          className={cn(
            "text-xs capitalize",
            clasificacion === "gasto op"
              ? "bg-blue-100 text-blue-800"
              : clasificacion === "honorarios"
              ? "bg-green-100 text-green-800"
              : clasificacion === "servicios"
              ? "bg-purple-100 text-purple-800"
              : clasificacion === "arrendamiento"
              ? "bg-orange-100 text-orange-800"
              : clasificacion === "comisiones"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          )}
        >
          {clasificacionCapitalized}
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
      const categoriaCapitalized =
        categoria.charAt(0).toUpperCase() + categoria.slice(1);
      return (
        <Badge
          variant="secondary"
          className={cn(
            "text-xs capitalize",
            categoria === "facturación"
              ? "bg-green-100 text-green-800"
              : categoria === "comisiones"
              ? "bg-yellow-100 text-yellow-800"
              : categoria === "disposición"
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          )}
        >
          {categoriaCapitalized}
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
      const formaPagoCapitalized =
        formaPago.charAt(0).toUpperCase() + formaPago.slice(1);
      return (
        <Badge
          variant="outline"
          className={cn(
            "text-xs capitalize",
            formaPago === "transferencia"
              ? "bg-blue-100 text-blue-800"
              : formaPago === "efectivo"
              ? "bg-green-100 text-green-800"
              : "bg-orange-100 text-orange-800"
          )}
        >
          {formaPagoCapitalized}
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
      const estadoCapitalized =
        estado.charAt(0).toUpperCase() + estado.slice(1);
      return (
        <Badge
          variant={estado === "pagado" ? "default" : "secondary"}
          className={cn(
            "text-xs capitalize",
            estado === "pagado"
              ? "bg-green-100 text-green-800"
              : estado === "pendiente"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          )}
        >
          {estadoCapitalized}
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
    cell: ({ row }) => {
      const solicitante = row.getValue("solicitante") as string;
      return <div className="text-sm truncate uppercase">{solicitante}</div>;
    },
    size: 10,
  },
  {
    header: "Autorizador",
    accessorKey: "autorizador",
    cell: ({ row }) => {
      const autorizador = row.getValue("autorizador") as string;
      return <div className="text-sm truncate uppercase">{autorizador}</div>;
    },
    size: 10,
  },
  {
    header: "Facturado Por",
    accessorKey: "facturadoPor",
    cell: ({ row }) => {
      const facturadoPor = row.getValue("facturadoPor") as string;
      return <div className="text-sm truncate uppercase">{facturadoPor}</div>;
    },
    size: 12,
  },
  {
    header: "Ingresado Por",
    accessorKey: "ingresadoPorNombre",
    cell: ({ row }) => {
      const ingresadoPorNombre = row.getValue("ingresadoPorNombre") as string | null;
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
      const egreso = row.original;
      return <UploadEgresoColumn egresoId={egreso.id} />;
    },
    size: 9,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Acciones</span>,
    cell: ({ row }) => <EgresoRowActions row={row} />,
    size: 1,
    enableHiding: false,
  },
];
