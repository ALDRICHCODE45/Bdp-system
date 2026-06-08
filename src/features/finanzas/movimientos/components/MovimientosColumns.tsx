"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/core/shared/ui/checkbox";
import { Badge } from "@/core/shared/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/shared/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/shared/ui/dropdown-menu";
import { Button } from "@/core/shared/ui/button";
import { cn } from "@/core/lib/utils";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { MovimientoListItemDto } from "../server/dtos/MovimientoListDto.dto";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MXN_FORMATTER = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

const formatDate = (iso: string) =>
  format(parseISO(iso), "d MMM yyyy", { locale: es });

// ---------------------------------------------------------------------------
// Shared cell renderers
// ---------------------------------------------------------------------------

const EmptyCell = () => (
  <span className="text-xs text-muted-foreground">&mdash;</span>
);

function TextCell({
  value,
  maxWidth = 160,
}: {
  value: string | null | undefined;
  maxWidth?: number;
}) {
  if (!value) return <EmptyCell />;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="text-xs truncate block" style={{ maxWidth }}>
          {value}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs max-w-[320px]">{value}</p>
      </TooltipContent>
    </Tooltip>
  );
}

// ---------------------------------------------------------------------------
// Tipo badge colors
// ---------------------------------------------------------------------------

const TIPO_BADGE: Record<string, string> = {
  INGRESO:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-0",
  EGRESO:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0",
};

const ESTADO_BADGE: Record<string, string> = {
  PAGADO:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-0",
  PENDIENTE:
    "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-0",
  CANCELADO:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0",
};

// ---------------------------------------------------------------------------
// Column factory
// ---------------------------------------------------------------------------

export type MovimientosColumnsCallbacks = {
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function getMovimientosColumns(
  opts: MovimientosColumnsCallbacks,
): ColumnDef<MovimientoListItemDto>[] {
  return [
    // ── Select ──────────────────────────────────────────────────────
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 2,
    },

    // ── Tipo ────────────────────────────────────────────────────────
    {
      accessorKey: "tipo",
      header: "Tipo",
      cell: ({ row }) => {
        const tipo = row.original.tipo;
        return (
          <Badge
            variant="secondary"
            className={cn("text-xs", TIPO_BADGE[tipo])}
          >
            {tipo}
          </Badge>
        );
      },
      size: 8,
    },

    // ── Titular ─────────────────────────────────────────────────────
    {
      accessorKey: "titular",
      header: "Titular",
      cell: ({ row }) => <TextCell value={row.original.titular} />,
      size: 14,
    },

    // ── Estado Cuenta ───────────────────────────────────────────────
    {
      accessorKey: "estadoCuenta",
      header: "Estado Cuenta",
      cell: ({ row }) => (
        <TextCell value={row.original.estadoCuenta} maxWidth={140} />
      ),
      size: 12,
    },

    // ── Fecha Operacion ─────────────────────────────────────────────
    {
      accessorKey: "fechaOperacion",
      header: "Fecha Op.",
      cell: ({ row }) => (
        <div className="text-xs">{formatDate(row.original.fechaOperacion)}</div>
      ),
      size: 10,
    },

    // ── Fecha Corte ─────────────────────────────────────────────────
    {
      accessorKey: "fechaCorte",
      header: "Fecha Corte",
      cell: ({ row }) => (
        <div className="text-xs">{formatDate(row.original.fechaCorte)}</div>
      ),
      size: 10,
    },

    // ── Descripcion Literal ─────────────────────────────────────────
    {
      accessorKey: "descripcionLiteral",
      header: "Descripcion",
      cell: ({ row }) => (
        <TextCell value={row.original.descripcionLiteral} maxWidth={200} />
      ),
      size: 20,
    },

    // ── Concepto ────────────────────────────────────────────────────
    {
      accessorKey: "concepto",
      header: "Concepto",
      cell: ({ row }) => (
        <TextCell value={row.original.concepto} maxWidth={180} />
      ),
      size: 16,
    },

    // ── Monto ───────────────────────────────────────────────────────
    // CRITICAL: INGRESO → bold, EGRESO → red
    {
      accessorKey: "monto",
      header: "Monto",
      cell: ({ row }) => {
        const tipo = row.original.tipo;
        const monto = parseFloat(row.original.monto);
        return (
          <span
            className={cn(
              "text-xs tabular-nums",
              tipo === "INGRESO" && "font-bold",
              tipo === "EGRESO" && "text-red-600 dark:text-red-400",
            )}
          >
            {MXN_FORMATTER.format(monto)}
          </span>
        );
      },
      size: 12,
    },

    // ── Estado ──────────────────────────────────────────────────────
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.original.estado;
        return (
          <Badge
            variant="secondary"
            className={cn("text-xs", ESTADO_BADGE[estado])}
          >
            {estado}
          </Badge>
        );
      },
      size: 10,
    },

    // ── Categoria ───────────────────────────────────────────────────
    {
      accessorKey: "categoria",
      header: "Categoria",
      cell: ({ row }) => <TextCell value={row.original.categoria} />,
      size: 10,
    },

    // ── Forma Pago ──────────────────────────────────────────────────
    {
      accessorKey: "formaPago",
      header: "Forma Pago",
      cell: ({ row }) => <TextCell value={row.original.formaPago} />,
      size: 10,
    },

    // ── Cargo/Abono ─────────────────────────────────────────────────
    {
      accessorKey: "cargoAbono",
      header: "Cargo/Abono",
      cell: ({ row }) => <TextCell value={row.original.cargoAbono} />,
      size: 10,
    },

    // ── Facturado Por ───────────────────────────────────────────────
    {
      accessorKey: "facturadoPor",
      header: "Facturado Por",
      cell: ({ row }) => <TextCell value={row.original.facturadoPor} />,
      size: 10,
    },

    // ── Periodo ─────────────────────────────────────────────────────
    {
      accessorKey: "periodo",
      header: "Periodo",
      cell: ({ row }) => <TextCell value={row.original.periodo} maxWidth={100} />,
      size: 8,
    },

    // ── Proveedor ───────────────────────────────────────────────────
    {
      accessorKey: "proveedor",
      header: "Proveedor",
      cell: ({ row }) => (
        <TextCell
          value={row.original.proveedorNombre ?? row.original.proveedor}
        />
      ),
      size: 14,
    },

    // ── Cliente ─────────────────────────────────────────────────────
    {
      accessorKey: "cliente",
      header: "Cliente",
      cell: ({ row }) => (
        <TextCell value={row.original.clienteNombre ?? row.original.cliente} />
      ),
      size: 14,
    },

    // ── Solicitante ─────────────────────────────────────────────────
    {
      accessorKey: "solicitanteNombre",
      header: "Solicitante",
      cell: ({ row }) => <TextCell value={row.original.solicitanteNombre} />,
      size: 14,
    },

    // ── Autorizador ─────────────────────────────────────────────────
    {
      accessorKey: "autorizadorNombre",
      header: "Autorizador",
      cell: ({ row }) => <TextCell value={row.original.autorizadorNombre} />,
      size: 14,
    },

    // ── Numero Factura ──────────────────────────────────────────────
    {
      accessorKey: "numeroFactura",
      header: "No. Factura",
      cell: ({ row }) => (
        <TextCell value={row.original.numeroFactura} maxWidth={120} />
      ),
      size: 10,
    },

    // ── Folio Fiscal ────────────────────────────────────────────────
    {
      accessorKey: "folioFiscal",
      header: "Folio Fiscal",
      cell: ({ row }) => (
        <TextCell value={row.original.folioFiscal} maxWidth={120} />
      ),
      size: 10,
    },

    // ── Ingresado Por ───────────────────────────────────────────────
    {
      accessorKey: "ingresadoPorNombre",
      header: "Ingresado Por",
      cell: ({ row }) => <TextCell value={row.original.ingresadoPorNombre} />,
      size: 14,
    },

    // ── Created At ──────────────────────────────────────────────────
    {
      accessorKey: "createdAt",
      header: "Fecha Registro",
      cell: ({ row }) => (
        <div className="text-xs">{formatDate(row.original.createdAt)}</div>
      ),
      size: 10,
    },

    // ── Actions ─────────────────────────────────────────────────────
    {
      id: "actions",
      header: () => <span className="sr-only">Acciones</span>,
      cell: ({ row }) => {
        const mov = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal truncate max-w-[180px]">
                {mov.descripcionLiteral.length > 28
                  ? mov.descripcionLiteral.slice(0, 28) + "..."
                  : mov.descripcionLiteral}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* View */}
              <PermissionGuard
                permissions={[
                  PermissionActions.movimientos.acceder,
                  PermissionActions.movimientos.gestionar,
                ]}
              >
                <DropdownMenuItem
                  onClick={() => opts.onView(mov.id)}
                  className="gap-2"
                >
                  <Eye className="size-4 text-muted-foreground" />
                  Ver detalle
                </DropdownMenuItem>
              </PermissionGuard>

              <DropdownMenuSeparator />

              {/* Edit */}
              <PermissionGuard
                permissions={[
                  PermissionActions.movimientos.editar,
                  PermissionActions.movimientos.gestionar,
                ]}
              >
                <DropdownMenuItem
                  onClick={() => opts.onEdit(mov.id)}
                  className="gap-2"
                >
                  <Pencil className="size-4 text-muted-foreground" />
                  Editar
                </DropdownMenuItem>
              </PermissionGuard>

              {/* Delete */}
              <PermissionGuard
                permissions={[
                  PermissionActions.movimientos.eliminar,
                  PermissionActions.movimientos.gestionar,
                ]}
              >
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => opts.onDelete(mov.id)}
                  className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <Trash2 className="size-4" />
                  Eliminar
                </DropdownMenuItem>
              </PermissionGuard>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableHiding: false,
      size: 6,
    },
  ];
}

/**
 * Default column visibility — show the most important columns,
 * hide the rest for a clean initial view.
 */
export const MOVIMIENTOS_DEFAULT_VISIBILITY: Record<string, boolean> = {
  tipo: true,
  titular: true,
  fechaOperacion: true,
  descripcionLiteral: true,
  monto: true,
  estado: true,
  categoria: true,
  // Hidden by default
  estadoCuenta: false,
  fechaCorte: false,
  concepto: false,
  formaPago: false,
  cargoAbono: false,
  facturadoPor: false,
  periodo: false,
  proveedor: false,
  cliente: false,
  solicitanteNombre: false,
  autorizadorNombre: false,
  numeroFactura: false,
  folioFiscal: false,
  ingresadoPorNombre: false,
  createdAt: false,
};
