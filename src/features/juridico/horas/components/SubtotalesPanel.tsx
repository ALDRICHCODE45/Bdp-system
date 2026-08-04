"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Clock, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/core/shared/ui/card";
import { Badge } from "@/core/shared/ui/badge";
import { formatHoras } from "../helpers/formatHoras";
import type { SubtotalesDto } from "../server/dtos/ReporteHorasAgrupadoDto.dto";

interface SubtotalesPanelProps {
  subtotales: SubtotalesDto | undefined;
  isLoading: boolean;
}

interface BreakdownSectionProps {
  title: string;
  rows: { id: string; nombre: string; horas: number; grupos: number }[];
  emptyMessage: string;
}

function BreakdownSection({
  title,
  rows,
  emptyMessage,
}: BreakdownSectionProps) {
  const [open, setOpen] = useState(true);
  const sorted = [...rows].sort((a, b) => b.horas - a.horas);

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/40 transition-colors text-left"
      >
        <span className="text-sm font-semibold">{title}</span>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {rows.length}
          </Badge>
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>
      {open && (
        <div className="border-t">
          {sorted.length === 0 ? (
            <div className="px-4 py-3 text-xs text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-muted/30 text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-1.5 font-medium">Nombre</th>
                  <th className="text-right px-3 py-1.5 font-medium">Horas</th>
                  <th className="text-right px-3 py-1.5 font-medium">Grupos</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-border/50 first:border-t-0"
                  >
                    <td className="px-3 py-1.5 truncate max-w-[200px]">
                      {row.nombre}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                      {formatHoras(row.horas)}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono tabular-nums">
                      {row.grupos.toLocaleString("es-MX")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export function SubtotalesPanel({
  subtotales,
  isLoading,
}: SubtotalesPanelProps) {
  return (
    <Card className="p-2">
      <CardContent className="space-y-3">
        {/* Totals row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border bg-card p-3 flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-md shrink-0">
              <Clock className="h-3.5 w-3.5 text-blue-700" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Total Horas</div>
              <div className="text-xl font-bold tabular-nums">
                {isLoading || !subtotales ? (
                  <span className="text-muted-foreground text-sm">—</span>
                ) : (
                  formatHoras(subtotales.totalHoras)
                )}
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-3 flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded-md shrink-0">
              <BarChart3 className="h-3.5 w-3.5 text-green-700" />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">Total Grupos</div>
              <div className="text-xl font-bold tabular-nums">
                {isLoading || !subtotales ? (
                  <span className="text-muted-foreground text-sm">—</span>
                ) : (
                  subtotales.totalGrupos.toLocaleString("es-MX")
                )}
              </div>
            </div>
          </div>
        </div>

        {subtotales && (
          <div className="space-y-2">
            <BreakdownSection
              title="Por abogado"
              rows={subtotales.porAbogado}
              emptyMessage="Sin abogados en el set filtrado."
            />
            <BreakdownSection
              title="Por cliente"
              rows={subtotales.porCliente}
              emptyMessage="Sin clientes en el set filtrado."
            />
            <BreakdownSection
              title="Por asunto"
              rows={subtotales.porAsunto}
              emptyMessage="Sin asuntos en el set filtrado."
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
