"use client";

import { Badge } from "@/core/shared/ui/badge";
import type { TarifaAbogadoAsuntoDto } from "../../server/dtos/TarifaAbogadoAsuntoDto.dto";
import { TarifaRowActions } from "../TarifaRowActions";

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatTarifa(raw: string): string {
  const n = Number(raw);
  return Number.isFinite(n) ? mxn.format(n) : raw;
}

interface TarifaMobileCardProps {
  tarifa: TarifaAbogadoAsuntoDto;
}

export function TarifaMobileCard({ tarifa }: TarifaMobileCardProps) {
  const updatedAt = new Date(tarifa.updatedAt);

  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm hover:bg-accent/50 transition-colors">
      {/* ── Línea 1: Abogado + estado badge ─────────────────────────────── */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="font-medium text-sm truncate flex-1 leading-tight">
          {tarifa.usuarioNombre}
        </span>
        <div className="shrink-0">
          {tarifa.activa ? (
            <Badge className="bg-green-100 text-green-800 text-xs">
              Activa
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              Inactiva
            </Badge>
          )}
        </div>
      </div>

      {/* ── Línea 2: Asunto jurídico ───────────────────────────────────── */}
      <div className="mb-1.5 text-xs text-muted-foreground truncate">
        {tarifa.asuntoJuridicoNombre}
      </div>

      {/* ── Línea 3: Tarifa + última edición ───────────────────────────── */}
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono tabular-nums text-sm font-medium">
          {formatTarifa(tarifa.tarifaHora)}
        </span>
        <span className="text-xs text-muted-foreground shrink-0">
          {updatedAt.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {/* ── Footer: menú de acciones ───────────────────────────────────── */}
      <div className="flex items-center justify-end mt-2 pt-2 border-t border-border/50">
        <TarifaRowActions tarifa={tarifa} />
      </div>
    </div>
  );
}
