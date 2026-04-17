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
import { Badge } from "@/core/shared/ui/badge";
import { useGetRegistroHoraHistorial } from "../hooks/useGetRegistroHoraHistorial.hook";
import { Loader2, History } from "lucide-react";

interface RegistroHoraHistorialSheetProps {
  registroHoraId: string;
  isOpen: boolean;
  onClose: () => void;
}

const FIELD_LABELS: Record<string, string> = {
  horas: "Horas",
  descripcion: "Descripción",
  equipoJuridicoId: "Equipo Jurídico",
  clienteJuridicoId: "Cliente Jurídico",
  asuntoJuridicoId: "Asunto Jurídico",
  socioId: "Socio",
};

export function RegistroHoraHistorialSheet({
  registroHoraId,
  isOpen,
  onClose,
}: RegistroHoraHistorialSheetProps) {
  const { data: historial, isPending, isError } = useGetRegistroHoraHistorial(
    registroHoraId
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="overflow-y-auto w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Cambios
          </SheetTitle>
          <SheetDescription>
            Registro cronológico de modificaciones realizadas.
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 px-1 space-y-4">
          {isPending && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {isError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-sm text-red-700">
                No se pudo cargar el historial.
              </p>
            </div>
          )}

          {!isPending && !isError && historial && historial.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <History className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No hay cambios registrados para este registro.
              </p>
            </div>
          )}

          {historial &&
            historial.map((entry) => (
              <div
                key={entry.id}
                className="rounded-md border bg-card px-4 py-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-medium">
                    {FIELD_LABELS[entry.campo] ?? entry.campo}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.fechaCambio).toLocaleString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Anterior</p>
                    <p className="font-mono bg-muted rounded px-2 py-1 break-all">
                      {entry.valorAnterior ?? <em className="text-muted-foreground">vacío</em>}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Nuevo</p>
                    <p className="font-mono bg-muted rounded px-2 py-1 break-all">
                      {entry.valorNuevo}
                    </p>
                  </div>
                </div>

                {entry.motivo && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Motivo:</span> {entry.motivo}
                  </p>
                )}
              </div>
            ))}
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
