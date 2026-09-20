"use client";

import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/core/shared/ui/badge";
import { Button } from "@/core/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/core/shared/ui/dropdown-menu";
import { cn } from "@/core/lib/utils";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import type { MovimientoListItemDto } from "../../server/dtos/MovimientoListDto.dto";

// ---------------------------------------------------------------------------
// Formatters (mirror MovimientosColumns)
// ---------------------------------------------------------------------------

const MXN_FORMATTER = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

/** Format an ISO date string as "d MMM yyyy" in UTC (date-only, no tz drift). */
const UTC_DATE_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
  year: "numeric",
});
const formatDate = (iso: string) => UTC_DATE_FORMATTER.format(new Date(iso));

// ---------------------------------------------------------------------------
// Badge colors (mirror MovimientosColumns)
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
// Props
// ---------------------------------------------------------------------------

interface MovimientoMobileCardProps {
  movimiento: MovimientoListItemDto;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function MovimientoMobileCard({
  movimiento,
  onView,
  onEdit,
  onDelete,
}: MovimientoMobileCardProps) {
  const monto = parseFloat(movimiento.monto);
  const truncatedDescripcion =
    movimiento.descripcionLiteral.length > 28
      ? movimiento.descripcionLiteral.slice(0, 28) + "…"
      : movimiento.descripcionLiteral;

  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm hover:bg-accent/50 transition-colors">
      {/* ── Línea 1: Tipo + Estado ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <Badge
          variant="secondary"
          className={cn("text-xs shrink-0", TIPO_BADGE[movimiento.tipo])}
        >
          {movimiento.tipo}
        </Badge>
        <Badge
          variant="secondary"
          className={cn("text-xs shrink-0", ESTADO_BADGE[movimiento.estado])}
        >
          {movimiento.estado}
        </Badge>
      </div>

      {/* ── Línea 2: Descripción ───────────────────────────────────────── */}
      <p className="font-medium text-sm leading-tight mb-1.5">
        {movimiento.descripcionLiteral}
      </p>

      {/* ── Línea 3: Titular + categoría ───────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2.5">
        <span className="truncate">{movimiento.titular}</span>
        {movimiento.categoria && (
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px]">
            {movimiento.categoria}
          </span>
        )}
      </div>

      {/* ── Footer: fecha + monto + acciones ───────────────────────────── */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span
            className={cn(
              "font-semibold text-sm tabular-nums",
              movimiento.tipo === "INGRESO" && "font-bold",
              movimiento.tipo === "EGRESO" && "text-red-600 dark:text-red-400",
            )}
          >
            {MXN_FORMATTER.format(monto)}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {formatDate(movimiento.fechaOperacion)}
          </span>
        </div>

        {/* ── Dropdown de acciones (espejo de MovimientosColumns) ──────── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal truncate max-w-[180px]">
              {truncatedDescripcion}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <PermissionGuard
              permissions={[
                PermissionActions.movimientos.acceder,
                PermissionActions.movimientos.gestionar,
              ]}
            >
              <DropdownMenuItem
                onClick={() => onView(movimiento.id)}
                className="gap-2"
              >
                <Eye className="size-4 text-muted-foreground" />
                Ver detalle
              </DropdownMenuItem>
            </PermissionGuard>

            <DropdownMenuSeparator />

            <PermissionGuard
              permissions={[
                PermissionActions.movimientos.editar,
                PermissionActions.movimientos.gestionar,
              ]}
            >
              <DropdownMenuItem
                onClick={() => onEdit(movimiento.id)}
                className="gap-2"
              >
                <Pencil className="size-4 text-muted-foreground" />
                Editar
              </DropdownMenuItem>
            </PermissionGuard>

            <PermissionGuard
              permissions={[
                PermissionActions.movimientos.eliminar,
                PermissionActions.movimientos.gestionar,
              ]}
            >
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(movimiento.id)}
                className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="size-4" />
                Eliminar
              </DropdownMenuItem>
            </PermissionGuard>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
