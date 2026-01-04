"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/core/shared/ui/dialog";
import { Badge } from "@/core/shared/ui/badge";
import { Separator } from "@/core/shared/ui/separator";
import { WeekStats } from "@/features/RecursosHumanos/asistencias/helpers/processAsistenciasStats";
import { AsistenciaDto } from "@/features/RecursosHumanos/asistencias/server/Dtos/AsistenciaDto.dto";
import { isLateEntryHelper } from "@/features/RecursosHumanos/asistencias/helpers/processAsistenciasStats";
import { formatDateTime } from "../helpers/formatColaboradorProfile";
import { cn } from "@/core/lib/utils";

interface ColaboradorAsistenciaDetailsDialogProps {
  weekStats: WeekStats | null;
  asistencias: AsistenciaDto[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Dialog que muestra los detalles de asistencias de una semana específica
 */
export function ColaboradorAsistenciaDetailsDialog({
  weekStats,
  asistencias,
  open,
  onOpenChange,
}: ColaboradorAsistenciaDetailsDialogProps) {
  if (!weekStats) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Asistencias de la semana</DialogTitle>
          <DialogDescription>{weekStats.weekRange}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Resumen de la semana */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-muted-foreground">
                Total de entradas
              </div>
              <div className="text-2xl font-bold">{asistencias.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-muted-foreground">
                Tardanzas
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-lg px-3 py-1",
                  weekStats.color === "green" &&
                    "border-green-500 text-green-700 dark:text-green-400",
                  weekStats.color === "yellow" &&
                    "border-yellow-500 text-yellow-700 dark:text-yellow-400",
                  weekStats.color === "red" &&
                    "border-red-500 text-red-700 dark:text-red-400"
                )}
              >
                {weekStats.tardanzas}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Lista de asistencias */}
          {asistencias.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay asistencias registradas para esta semana
            </div>
          ) : (
            <div className="space-y-2">
              {asistencias.map((asistencia) => {
                const fecha =
                  typeof asistencia.fecha === "string"
                    ? new Date(asistencia.fecha)
                    : asistencia.fecha;
                const esTardanza = isLateEntryHelper(fecha);

                return (
                  <div
                    key={asistencia.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {formatDateTime(fecha)}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "ml-4",
                        esTardanza
                          ? "border-red-500 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20"
                          : "border-green-500 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20"
                      )}
                    >
                      {esTardanza ? "Tardanza" : "Puntual"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

