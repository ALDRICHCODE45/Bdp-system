"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Clock, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/core/shared/ui/card";
import { Badge } from "@/core/shared/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/core/shared/ui/collapsible";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/core/shared/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/shared/ui/table";
import { formatHoras } from "../helpers/formatHoras";
import type { SubtotalesDto } from "../server/dtos/ReporteHorasAgrupadoDto.dto";

interface SubtotalesPanelProps {
  subtotales: SubtotalesDto | undefined;
  isLoading: boolean;
}

type BreakdownRow = { id: string; nombre: string; horas: number; grupos: number };
type BreakdownKey = "abogado" | "cliente" | "asunto";

interface BreakdownTableProps {
  rows: BreakdownRow[];
  emptyMessage: string;
}

function BreakdownTable({ rows, emptyMessage }: BreakdownTableProps) {
  const sorted = useMemo(
    () => [...rows].sort((a, b) => b.horas - a.horas),
    [rows],
  );

  if (sorted.length === 0) {
    return (
      <div className="px-4 py-3 text-xs text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableHead className="text-muted-foreground text-xs font-medium">
            Nombre
          </TableHead>
          <TableHead className="text-muted-foreground text-xs font-medium text-right">
            Horas
          </TableHead>
          <TableHead className="text-muted-foreground text-xs font-medium text-right">
            Grupos
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((row) => (
          <TableRow key={row.id} className="border-border/50">
            <TableCell className="truncate max-w-[240px] py-2">
              {row.nombre}
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums py-2">
              {formatHoras(row.horas)}
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums py-2">
              {row.grupos.toLocaleString("es-MX")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function SubtotalesPanel({
  subtotales,
  isLoading,
}: SubtotalesPanelProps) {
  const [open, setOpen] = useState(true);
  const [breakdownKey, setBreakdownKey] = useState<BreakdownKey>("abogado");

  const breakdownData = useMemo(() => {
    if (!subtotales) {
      return {
        abogado: [] as BreakdownRow[],
        cliente: [] as BreakdownRow[],
        asunto: [] as BreakdownRow[],
      };
    }
    return {
      abogado: subtotales.porAbogado,
      cliente: subtotales.porCliente,
      asunto: subtotales.porAsunto,
    };
  }, [subtotales]);

  return (
    <Card className="p-2">
      <CardContent className="space-y-3">
        {/* KPI row — always visible, even when the panel is collapsed */}
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

        {/* Collapsible breakdowns */}
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger
            className="w-full flex items-center justify-between px-1 py-1.5 rounded hover:bg-muted/40 transition-colors text-left"
            aria-label="Mostrar u ocultar breakdowns"
          >
            <span className="text-sm font-semibold">Breakdowns</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {subtotales
                  ? subtotales.porAbogado.length +
                    subtotales.porCliente.length +
                    subtotales.porAsunto.length
                  : 0}
              </Badge>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
            {!subtotales ? (
              <div className="rounded-lg border bg-card px-4 py-3 text-xs text-muted-foreground">
                Sin subtotales para mostrar.
              </div>
            ) : (
              <Tabs
                value={breakdownKey}
                onValueChange={(v) => setBreakdownKey(v as BreakdownKey)}
                className="rounded-lg border bg-card p-2"
              >
                <TabsList className="self-start">
                  <TabsTrigger value="abogado">
                    Por abogado
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({subtotales.porAbogado.length})
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="cliente">
                    Por cliente
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({subtotales.porCliente.length})
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="asunto">
                    Por asunto
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({subtotales.porAsunto.length})
                    </span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="abogado" className="mt-2">
                  <BreakdownTable
                    rows={breakdownData.abogado}
                    emptyMessage="Sin abogados en el set filtrado."
                  />
                </TabsContent>
                <TabsContent value="cliente" className="mt-2">
                  <BreakdownTable
                    rows={breakdownData.cliente}
                    emptyMessage="Sin clientes en el set filtrado."
                  />
                </TabsContent>
                <TabsContent value="asunto" className="mt-2">
                  <BreakdownTable
                    rows={breakdownData.asunto}
                    emptyMessage="Sin asuntos en el set filtrado."
                  />
                </TabsContent>
              </Tabs>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
