"use client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/core/shared/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/core/shared/ui/accordion";
import { Button } from "@/core/shared/ui/button";
import { Badge } from "@/core/shared/ui/badge";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { useFacturaHistorial } from "../hooks/useFacturaHistorial.hook";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import { formatFieldName } from "../helpers/formatHistorialField";
import { formatFieldValue } from "../helpers/formatHistorialField";
import { Spinner } from "@/core/shared/ui/spinner";
import { History, AlertCircle, ArrowRight, CalendarDays } from "lucide-react";
import { FacturaHistorialDto } from "../server/dtos/FacturaHistorialDto.dto";

interface FacturaHistorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  facturaConcepto: string;
  facturaId: string;
}

/** Agrupa los registros de historial por día (yyyy-MM-dd) */
function groupByDay(
  historial: FacturaHistorialDto[],
): { dayKey: string; label: string; items: FacturaHistorialDto[] }[] {
  const map = new Map<string, FacturaHistorialDto[]>();

  for (const item of historial) {
    const fecha = parseISO(item.fechaCambio);
    const key = format(fecha, "yyyy-MM-dd");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }

  return Array.from(map.entries()).map(([key, items]) => {
    const fecha = parseISO(key);
    let label: string;
    if (isToday(fecha)) {
      label = "Hoy";
    } else if (isYesterday(fecha)) {
      label = "Ayer";
    } else {
      label = format(fecha, "EEEE d 'de' MMMM yyyy", { locale: es });
      label = label.charAt(0).toUpperCase() + label.slice(1);
    }
    return { dayKey: key, label, items };
  });
}

interface ChangeEntryProps {
  item: FacturaHistorialDto;
}

function ChangeEntry({ item }: ChangeEntryProps) {
  const hora = format(parseISO(item.fechaCambio), "HH:mm", { locale: es });
  const fieldLabel = formatFieldName(item.campo);
  const oldValue = formatFieldValue(item.campo, item.valorAnterior);
  const newValue = formatFieldValue(item.campo, item.valorNuevo);

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card px-4 py-3 text-sm shadow-sm">
      {/* Header row: field name + timestamp */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-foreground">{fieldLabel}</span>
        <span className="shrink-0 text-xs text-muted-foreground">{hora}</span>
      </div>

      {/* Old → New */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-mono text-destructive line-through">
          {oldValue}
        </span>
        <ArrowRight className="size-3 shrink-0 text-muted-foreground" />
        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-mono text-primary font-medium">
          {newValue}
        </span>
      </div>

      {/* Motivo (optional) */}
      {item.motivo && (
        <p className="text-xs text-muted-foreground border-t pt-2 mt-1">
          <span className="font-medium">Motivo:</span> {item.motivo}
        </p>
      )}
    </div>
  );
}

export function FacturaHistorySheet({
  isOpen,
  onClose,
  facturaConcepto: _facturaConcepto,
  facturaId,
}: FacturaHistorySheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";

  const {
    data: historial,
    isLoading,
    isError,
    error,
    refetch,
  } = useFacturaHistorial(facturaId, isOpen);

  const groups = historial ? groupByDay(historial) : [];
  // Default open: the first (most recent) day
  const defaultOpenValues = groups.length > 0 ? [groups[0].dayKey] : [];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side={sheetSide}
        className="w-full sm:min-w-xl flex flex-col"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            Historial de cambios
          </SheetTitle>
          <SheetDescription>
            Registro de todas las modificaciones realizadas en esta factura.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-2">
          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-48">
              <Spinner className="size-8" />
              <p className="mt-3 text-sm text-muted-foreground">
                Cargando historial...
              </p>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-destructive mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-destructive text-sm">
                    Error al cargar el historial
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {error instanceof Error
                      ? error.message
                      : "Ocurrió un error inesperado"}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => refetch()}
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && historial && historial.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
              <div className="rounded-full bg-muted p-4">
                <History className="size-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Sin historial de cambios
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Aquí aparecerán los cambios que se realicen en esta factura.
                </p>
              </div>
            </div>
          )}

          {/* Grouped accordion */}
          {!isLoading && !isError && groups.length > 0 && (
            <Accordion
              type="multiple"
              defaultValue={defaultOpenValues}
              className="space-y-2"
            >
              {groups.map(({ dayKey, label, items }) => (
                <AccordionItem
                  key={dayKey}
                  value={dayKey}
                  className="rounded-lg border bg-muted/20 px-3 m-2"
                >
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-semibold">{label}</span>
                      <Badge variant="secondary" className="ml-1 text-xs h-5">
                        {items.length}{" "}
                        {items.length === 1 ? "cambio" : "cambios"}
                      </Badge>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pb-3">
                    <div className="space-y-2 pt-1">
                      {items.map((item) => (
                        <ChangeEntry key={item.id} item={item} />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        <SheetFooter className="mt-4">
          <SheetClose asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              Cerrar
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
