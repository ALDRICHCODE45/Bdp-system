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
import { useColaboradorHistorial } from "../hooks/useColaboradorHistorial.hook";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/core/shared/ui/timeline";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { formatFieldName } from "../helpers/formatHistorialField";
import { formatChangeDescription } from "../helpers/formatHistorialChange";
import { Spinner } from "@/core/shared/ui/spinner";
import {
  History,
  AlertCircle,
  Edit,
  User,
  DollarSign,
  Building2,
  CreditCard,
  FileText,
  CheckCircle2,
  CalendarDays,
  Phone,
} from "lucide-react";

interface ColaboradorHistorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  colaboradorName: string;
  colaboradorId: string;
}

export function ColaboradorHistorySheet({
  isOpen,
  onClose,
  colaboradorName,
  colaboradorId,
}: ColaboradorHistorySheetProps) {
  const isMobile = useIsMobile();
  const sheetSide = isMobile ? "bottom" : "right";

  const {
    data: historial,
    isLoading,
    isError,
    error,
    refetch,
  } = useColaboradorHistorial(colaboradorId, isOpen);

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

  const getFieldIcon = (campo: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      name: <User className="size-4" />,
      correo: <FileText className="size-4" />,
      puesto: <Building2 className="size-4" />,
      status: <CheckCircle2 className="size-4" />,
      imss: <CheckCircle2 className="size-4" />,
      socioId: <User className="size-4" />,
      banco: <Building2 className="size-4" />,
      clabe: <CreditCard className="size-4" />,
      sueldo: <DollarSign className="size-4" />,
      activos: <FileText className="size-4" />,
      fechaIngreso: <CalendarDays className="size-4" />,
      genero: <User className="size-4" />,
      fechaNacimiento: <CalendarDays className="size-4" />,
      nacionalidad: <User className="size-4" />,
      estadoCivil: <User className="size-4" />,
      tipoSangre: <FileText className="size-4" />,
      direccion: <Building2 className="size-4" />,
      telefono: <Phone className="size-4" />,
      rfc: <FileText className="size-4" />,
      curp: <FileText className="size-4" />,
      ultimoGradoEstudios: <FileText className="size-4" />,
      escuela: <Building2 className="size-4" />,
      ultimoTrabajo: <Building2 className="size-4" />,
      nombreReferenciaPersonal: <User className="size-4" />,
      telefonoReferenciaPersonal: <Phone className="size-4" />,
      parentescoReferenciaPersonal: <User className="size-4" />,
      nombreReferenciaLaboral: <User className="size-4" />,
      telefonoReferenciaLaboral: <Phone className="size-4" />,
    };
    return iconMap[campo] || <Edit className="size-4" />;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side={sheetSide} className="w-full sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Historial del colaborador</SheetTitle>
          <SheetDescription>
            Información detallada de los cambios realizados para{" "}
            <span className="font-bold">{colaboradorName}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="h-[80vh] overflow-y-auto mt-6 pr-2">
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
                No hay historial de cambios para este colaborador
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
