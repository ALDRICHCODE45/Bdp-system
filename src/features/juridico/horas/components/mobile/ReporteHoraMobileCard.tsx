"use client";

import { Badge } from "@/core/shared/ui/badge";
import { formatHoras } from "../../helpers/formatHoras";
import type { ReporteHorasRowDto } from "../../server/dtos/ReporteHorasDto.dto";

interface ReporteHoraMobileCardProps {
  reporte: ReporteHorasRowDto;
}

function formatWeekLabel(semana: number, ano: number): string {
  return `Sem ${semana} - ${ano}`;
}

export function ReporteHoraMobileCard({
  reporte,
}: ReporteHoraMobileCardProps) {
  const weekLabel = formatWeekLabel(reporte.semana, reporte.ano);
  const horasLabel = formatHoras(reporte.horas);

  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm">
      {/* ── Línea 1: Semana + Horas ───────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <Badge variant="outline" className="font-mono text-xs shrink-0">
          {weekLabel}
        </Badge>
        <Badge
          variant="secondary"
          className="bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-mono text-xs shrink-0"
        >
          {horasLabel}
        </Badge>
      </div>

      {/* ── Línea 2: Abogado ──────────────────────────────────────────── */}
      <p className="text-sm font-medium truncate mb-0.5">
        {reporte.usuarioNombre}
      </p>
      <p className="text-xs text-muted-foreground truncate mb-1">
        {reporte.usuarioEmail}
      </p>

      {/* ── Línea 3: Equipo — Cliente ─────────────────────────────────── */}
      <p className="text-xs text-muted-foreground truncate mb-0.5">
        {reporte.equipoNombre} —{" "}
        <span className="font-medium text-foreground">
          {reporte.clienteNombre}
        </span>
      </p>

      {/* ── Línea 4: Asunto ───────────────────────────────────────────── */}
      <p className="text-xs text-muted-foreground truncate mb-1">
        {reporte.asuntoNombre}
      </p>

      {/* ── Línea 5: Descripción ──────────────────────────────────────── */}
      {reporte.descripcion && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
          {reporte.descripcion}
        </p>
      )}

      {/* ── Footer: Socio ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground truncate">
          Socio: {reporte.socioNombre}
        </span>
        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
          {new Date(reporte.createdAt).toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
