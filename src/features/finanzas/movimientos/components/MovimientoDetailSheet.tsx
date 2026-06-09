"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/core/shared/ui/badge";
import { Button } from "@/core/shared/ui/button";
import { Separator } from "@/core/shared/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import { Spinner } from "@/core/shared/ui/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/core/shared/ui/tabs";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineItem,
  TimelineTitle,
} from "@/core/shared/ui/timeline";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { cn } from "@/core/lib/utils";
import { History } from "lucide-react";
import { useMovimientoById } from "../hooks/useMovimientoById.hook";
import { useMovimientoHistorial } from "../hooks/useMovimientoHistorial.hook";
import type { MovimientoDto } from "../server/dtos/MovimientoDto.dto";

interface MovimientoDetailSheetProps {
  movimientoId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const currencyFormatter = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const tipoBadge: Record<string, string> = { INGRESO: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-0", EGRESO: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0" };
const estadoBadge: Record<string, string> = { PAGADO: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-0", PENDIENTE: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-0", CANCELADO: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0" };

function InfoRow({ label, value, mono = false }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return <div className="space-y-1"><p className="text-xs text-muted-foreground">{label}</p><p className={cn("text-sm font-medium break-words", mono && "font-mono")}>{value || "—"}</p></div>;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <div className="space-y-3"><h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>{children}</div>;
}

/** UTC formatter for date-only fields (no tz drift for fechaOperacion/fechaCorte). */
const utcDateOnlyFormatter = new Intl.DateTimeFormat("es-MX", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(value?: string | null, includeTime = false) {
  if (!value) return null;
  try {
    if (includeTime) {
      // Audit timestamps (createdAt, updatedAt) — keep local timezone with time.
      return format(parseISO(value), "d MMM yyyy HH:mm", { locale: es });
    }
    // Date-only fields — render in UTC to avoid off-by-one in negative UTC offsets.
    return utcDateOnlyFormatter.format(new Date(value));
  } catch {
    return value;
  }
}

function formatRelativeDate(value: string) {
  try {
    const parsed = parseISO(value);
    const diffHours = (Date.now() - parsed.getTime()) / (1000 * 60 * 60);
    return diffHours < 24 ? formatDistanceToNow(parsed, { addSuffix: true, locale: es }) : format(parsed, "dd/MM/yyyy HH:mm", { locale: es });
  } catch {
    return value;
  }
}

function MovimientoInfoTab({ movimiento }: { movimiento: MovimientoDto }) {
  const partyLabel = movimiento.tipo === "INGRESO" ? "Cliente" : "Proveedor";
  const partyValue = movimiento.tipo === "INGRESO" ? movimiento.clienteNombre || movimiento.cliente : movimiento.proveedorNombre || movimiento.proveedor;

  return (
    <div className="space-y-5">
      <Section title="Resumen">
        <div className="grid gap-4 md:grid-cols-2">
          <InfoRow label="Tipo" value={movimiento.tipo} />
          <InfoRow label="Estado" value={movimiento.estado} />
          <InfoRow label="Monto" value={currencyFormatter.format(Number(movimiento.monto || 0))} mono />
          <InfoRow label="Titular" value={movimiento.titular} />
          <InfoRow label="Estado de cuenta" value={movimiento.estadoCuenta} />
          <InfoRow label={partyLabel} value={partyValue} />
        </div>
      </Section>

      <Separator />

      <Section title="Operación">
        <div className="grid gap-4 md:grid-cols-2">
          <InfoRow label="Fecha de operación" value={formatDate(movimiento.fechaOperacion)} />
          <InfoRow label="Fecha de corte" value={formatDate(movimiento.fechaCorte)} />
          <InfoRow label="Descripción literal" value={movimiento.descripcionLiteral} />
          <InfoRow label="Concepto" value={movimiento.concepto} />
          <InfoRow label="Categoría" value={movimiento.categoria} />
          <InfoRow label="Forma de pago" value={movimiento.formaPago} />
          <InfoRow label="Cargo / Abono" value={movimiento.cargoAbono} />
          <InfoRow label="Facturado por" value={movimiento.facturadoPor} />
        </div>
      </Section>

      <Separator />

      <Section title="Administración">
        <div className="grid gap-4 md:grid-cols-2">
          <InfoRow label="Descripción administrativa" value={movimiento.descripcionAdministracion} />
          <InfoRow label="Periodo" value={movimiento.periodo} />
          <InfoRow label="Número de factura" value={movimiento.numeroFactura} />
          <InfoRow label="Folio fiscal" value={movimiento.folioFiscal} />
          <InfoRow label="Solicitante" value={movimiento.solicitanteNombre} />
          <InfoRow label="Autorizador" value={movimiento.autorizadorNombre} />
          <InfoRow label="Notas" value={movimiento.notas} />
          <InfoRow label="Dedup hash" value={movimiento.dedupHash} mono />
        </div>
      </Section>

      <Separator />

      <Section title="Auditoría">
        <div className="grid gap-4 md:grid-cols-2">
          <InfoRow label="Ingresado por" value={movimiento.ingresadoPorNombre} />
          <InfoRow label="Creado" value={formatDate(movimiento.createdAt, true)} />
          <InfoRow label="Actualizado" value={formatDate(movimiento.updatedAt, true)} />
          <InfoRow label="ID" value={movimiento.id} mono />
        </div>
      </Section>
    </div>
  );
}

export function MovimientoDetailSheet({ movimientoId, isOpen, onClose }: MovimientoDetailSheetProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("info");
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(["info"]));
  const { data: movimiento, isPending, isError, error } = useMovimientoById(isOpen ? movimientoId ?? undefined : undefined);
  const historyEnabled = activeTab === "historial" || visitedTabs.has("historial");
  const { data: historial = [], isPending: historialPending, isError: historialError, error: historialLoadError } = useMovimientoHistorial(movimientoId ?? undefined, isOpen && historyEnabled);

  useEffect(() => {
    setActiveTab("info");
    setVisitedTabs(new Set(["info"]));
  }, [isOpen, movimientoId]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setVisitedTabs((current) => new Set([...current, tab]));
  }, []);

  const title = useMemo(() => movimiento?.concepto || movimiento?.descripcionLiteral || "Movimiento", [movimiento]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={isMobile ? "bottom" : "right"} className={cn("ml-0 flex w-full flex-col overflow-hidden p-0 sm:max-w-2xl", isMobile ? "max-h-[92dvh] rounded-t-2xl" : "h-full rounded-2xl")}>
        <SheetHeader className="border-b px-6 pt-6 pb-4 shrink-0">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Detalle de movimiento</p>
          <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>
          {movimiento ? <div className="mt-2 flex flex-wrap gap-2"><Badge variant="secondary" className={cn("text-xs", tipoBadge[movimiento.tipo] ?? "")}>{movimiento.tipo}</Badge><Badge variant="secondary" className={cn("text-xs", estadoBadge[movimiento.estado] ?? "")}>{movimiento.estado}</Badge></div> : null}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isPending ? <div className="flex h-full min-h-72 items-center justify-center"><Spinner className="size-6" /></div> : isError || !movimiento ? <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error instanceof Error ? error.message : "No se pudo cargar el movimiento."}</div> : (
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="w-full">
                <TabsTrigger value="info" className="flex-1">Información</TabsTrigger>
                <TabsTrigger value="historial" className="flex-1"><span className="flex items-center gap-1.5"><History className="size-3" />Historial</span></TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-5"><MovimientoInfoTab movimiento={movimiento} /></TabsContent>

              <TabsContent value="historial" className="mt-5">
                {historialPending ? <div className="flex items-center justify-center py-10"><Spinner className="size-6" /></div> : historialError ? <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">{historialLoadError instanceof Error ? historialLoadError.message : "No se pudo cargar el historial."}</div> : historial.length === 0 ? <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-center"><History className="mb-3 size-8 text-muted-foreground" /><p className="text-sm font-medium">Sin historial disponible</p><p className="mt-1 max-w-sm text-xs text-muted-foreground">Todavía no hay cambios registrados para este movimiento o el backend no devolvió entradas adicionales.</p></div> : (
                  <Timeline orientation="vertical" className="p-0">
                    {historial.map((item, index) => (
                      <TimelineItem key={item.id} step={index + 1} className="group-data-[orientation=vertical]/timeline:ms-0 group-data-[orientation=vertical]/timeline:not-last:pb-8">
                        <TimelineHeader className="relative"><TimelineTitle className="mt-0.5 text-sm font-semibold">{item.campo}</TimelineTitle></TimelineHeader>
                        <TimelineContent className="mt-2 rounded-lg border bg-muted/20 px-4 py-3">
                          <p className="text-sm">{item.valorAnterior ? `De “${item.valorAnterior}” a “${item.valorNuevo}”.` : `Nuevo valor: “${item.valorNuevo}”.`}</p>
                          {item.usuarioNombre ? <p className="mt-2 text-xs text-muted-foreground">Usuario: {item.usuarioNombre}</p> : null}
                          {item.motivo ? <p className="mt-1 text-xs text-muted-foreground">Motivo: {item.motivo}</p> : null}
                          <TimelineDate className="mt-3 mb-0 text-xs">{formatRelativeDate(item.fechaCambio)}</TimelineDate>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>

        <div className="border-t px-6 py-4 shrink-0"><Button variant="outline" onClick={onClose}>Cerrar</Button></div>
      </SheetContent>
    </Sheet>
  );
}
