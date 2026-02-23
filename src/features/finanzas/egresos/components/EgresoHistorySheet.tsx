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
import { Button } from "@/core/shared/ui/button";
import { useIsMobile } from "@/core/shared/hooks/use-mobile";
import { useEgresoHistorial } from "../hooks/useEgresoHistorial.hook";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineItem,
  TimelineTitle,
} from "@/core/shared/ui/timeline";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { formatFieldName } from "../helpers/formatHistorialField";
import { formatChangeDescription } from "../helpers/formatHistorialChange";
import { Spinner } from "@/core/shared/ui/spinner";
import { History, AlertCircle } from "lucide-react";

interface EgresoHistorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  egresoConcepto: string;
  egresoId: string;
}

export function EgresoHistorySheet({
  isOpen,
  onClose,
  egresoConcepto: _egresoConcepto,
  egresoId,
}: EgresoHistorySheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";

  const {
    data: historial,
    isLoading,
    isError,
    error,
    refetch,
  } = useEgresoHistorial(egresoId, isOpen);

  const formatFecha = (fechaString: string) => {
    try {
      const fecha = new Date(fechaString);
      const now = new Date();
      const diffInHours = (now.getTime() - fecha.getTime()) / (1000 * 60 * 60);

      // Si es hace menos de 24 horas, usar formatDistanceToNow
      if (diffInHours < 24) {
        return formatDistanceToNow(fecha, {
          addSuffix: true,
          locale: es,
        });
      }

      // Si es más antiguo, usar formato completo
      return format(fecha, "dd/MM/yyyy 'a las' HH:mm", { locale: es });
    } catch {
      return fechaString;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide} className="w-full sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Historial del egreso</SheetTitle>
          <SheetDescription>
            Información detallada de los cambios realizados para el ingreso.
          </SheetDescription>
        </SheetHeader>

        <div className="h-[80vh] overflow-y-auto mt-3 pr-2">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <Spinner className="size-10" />
              <p className="mt-4 text-sm text-muted-foreground">
                Cargando historial...
              </p>
            </div>
          )}

          {isError && (
            <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-destructive mb-2">Error</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {error instanceof Error
                      ? error.message
                      : "Error al cargar el historial"}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    Reintentar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!isLoading && !isError && historial && historial.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <History className="size-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                No hay historial de cambios para este egreso
              </p>
            </div>
          )}

          {!isLoading && !isError && historial && historial.length > 0 && (
            <Timeline orientation="vertical" className="p-4">
              {historial.map((item, index) => (
                <TimelineItem
                  key={item.id}
                  step={index + 1}
                  className="group-data-[orientation=vertical]/timeline:ms-0 group-data-[orientation=vertical]/timeline:not-last:pb-8"
                >
                  <TimelineHeader className="relative">
                    <TimelineTitle className="mt-0.5">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Campo modificado:
                      </span>{" "}
                      <span className="font-semibold">
                        {formatFieldName(item.campo)}
                      </span>
                    </TimelineTitle>
                  </TimelineHeader>
                  <TimelineContent className="mt-2 rounded-lg border px-4 py-3 text-foreground bg-muted/30">
                    <p className="text-sm leading-relaxed">
                      {formatChangeDescription(
                        item.campo,
                        item.valorAnterior,
                        item.valorNuevo
                      )}
                    </p>
                    {item.motivo && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Motivo:</span>{" "}
                          {item.motivo}
                        </p>
                      </div>
                    )}
                    <TimelineDate className="mt-3 mb-0 text-xs">
                      {formatFecha(item.fechaCambio)}
                    </TimelineDate>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          )}
        </div>

        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cerrar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
