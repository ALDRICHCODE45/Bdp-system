"use client";

import { Badge } from "@/core/shared/ui/badge";
import type { ReporteGrupoDto } from "../../server/dtos/ReporteHorasAgrupadoDto.dto";
import { formatHoras } from "../../helpers/formatHoras";

const ESTADO_LABELS: Record<string, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  CERRADO: "Cerrado",
};

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatPeriodo(ano: number, semana: number): string {
  return `Sem ${semana} · ${ano}`;
}

interface ReporteMobileCardProps {
  grupo: ReporteGrupoDto;
}

export function ReporteMobileCard({ grupo }: ReporteMobileCardProps) {
  const estado = grupo.estadoAsunto;
  const label = ESTADO_LABELS[estado] ?? estado;
  const estadoVariant =
    estado === "ACTIVO"
      ? "default"
      : estado === "CERRADO"
        ? "secondary"
        : "outline";

  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm">
      {/* ── Línea 1: Abogado + Badge periodo ────────────────────────────── */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="font-medium text-sm truncate flex-1 leading-tight">
          {grupo.usuarioNombre}
        </span>
        <div className="shrink-0">
          <Badge
            variant="outline"
            className="font-mono text-xs whitespace-nowrap"
          >
            {formatPeriodo(grupo.ano, grupo.semana)}
          </Badge>
        </div>
      </div>

      {/* ── Línea 2: cliente → asunto ───────────────────────────────────── */}
      <div className="mb-1 text-xs text-muted-foreground truncate">
        {[grupo.clienteNombre, grupo.asuntoNombre].filter(Boolean).join(" → ")}
      </div>

      {/* ── Línea 3: equipo · socio (opcional) ──────────────────────────── */}
      {[grupo.equipoNombre, grupo.socioNombre].some(Boolean) && (
        <div className="mb-2.5 text-xs text-muted-foreground truncate">
          {[grupo.equipoNombre, grupo.socioNombre].filter(Boolean).join(" · ")}
        </div>
      )}

      {/* ── Línea 4: estado del asunto ──────────────────────────────────── */}
      <div className="mb-2.5">
        <Badge variant={estadoVariant} className="text-xs">
          {label}
        </Badge>
      </div>

      {/* ── Footer: Horas + Importe ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border/50">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Horas</span>
          <span className="font-mono tabular-nums text-sm">
            {formatHoras(grupo.horas)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 text-right">
          <span className="text-xs text-muted-foreground">Importe</span>
          <span className="font-mono tabular-nums text-sm font-semibold">
            {mxn.format(grupo.importe)}
          </span>
        </div>
      </div>
    </div>
  );
}
