"use client";

import { useMemo } from "react";
import { Banknote, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/core/shared/ui/card";
import { Badge } from "@/core/shared/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/shared/ui/table";
import type { DashboardHorasDto } from "../../server/dtos/DashboardHorasDto.dto";

interface DashboardImportePorAbogadoCardProps {
  data: DashboardHorasDto | undefined;
  isLoading: boolean;
}

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * REQ-DH-100 / REQ-DH-101 — "Lo que se le debe a cada abogado".
 *
 * Muestra, por abogado, la suma de `importe` (MXN) de sus registros de
 * horas en el set filtrado, más un KPI de total. Cuando el session
 * user es administrador/socio ve la lista completa; cuando es abogado,
 * el service ya filtra al WHERE a su propio `usuarioId`, así que este
 * componente renderiza una sola fila (la suya) sin filtrar de nuevo.
 */
export function DashboardImportePorAbogadoCard({
  data,
  isLoading,
}: DashboardImportePorAbogadoCardProps) {
  const rows = useMemo(() => {
    if (!data) return [];
    return [...data.importePorUsuario].sort((a, b) => b.importe - a.importe);
  }, [data]);

  const total = data?.totalImporte ?? 0;

  return (
    <Card className="p-2">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 bg-emerald-100 rounded-md shrink-0">
              <Banknote className="h-4 w-4 text-emerald-700" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">
                Lo que se le debe a cada abogado
              </div>
              <div className="text-xs text-muted-foreground">
                Importe total por honorarios en el set filtrado
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs font-mono">
            {rows.length} {rows.length === 1 ? "abogado" : "abogados"}
          </Badge>
        </div>

        <div className="rounded-lg border bg-card p-3 flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 rounded-md shrink-0">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Importe total</div>
            <div className="text-xl font-bold tabular-nums font-mono">
              {isLoading || !data ? (
                <span className="text-muted-foreground text-sm">—</span>
              ) : (
                mxn.format(total)
              )}
            </div>
          </div>
        </div>

        {isLoading || !data ? (
          <div className="px-4 py-3 text-xs text-muted-foreground">Cargando…</div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-3 text-xs text-muted-foreground">
            Sin registros con importe en el set filtrado.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-muted-foreground text-xs font-medium">
                  Abogado
                </TableHead>
                <TableHead className="text-muted-foreground text-xs font-medium text-right">
                  Importe
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.email} className="border-border/50">
                  <TableCell className="py-2">
                    <div className="font-medium text-sm truncate max-w-[220px]">
                      {r.nombre}
                    </div>
                    <div className="text-xs text-muted-foreground truncate max-w-[220px]">
                      {r.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums py-2 font-semibold">
                    {mxn.format(r.importe)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
