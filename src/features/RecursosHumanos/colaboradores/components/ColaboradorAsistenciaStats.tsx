"use client";

import { useMemo, useState } from "react";
import { useColaboradorAsistencias } from "../hooks/useColaboradorAsistencias.hook";
import {
  processAsistenciasStats,
  filterWeeksBySelection,
  type WeekStats,
} from "@/features/RecursosHumanos/asistencias/helpers/processAsistenciasStats";
import { ColaboradorAsistenciaWeekSelector } from "./ColaboradorAsistenciaWeekSelector";
import { ColaboradorAsistenciaChart } from "./ColaboradorAsistenciaChart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/shared/ui/card";
import { Spinner } from "@/core/shared/ui/spinner";
import { AlertCircle } from "lucide-react";

interface ColaboradorAsistenciaStatsProps {
  correo: string;
}

const MAX_WEEKS = 6;

/**
 * Componente principal de estadísticas de asistencia
 */
export function ColaboradorAsistenciaStats({
  correo,
}: ColaboradorAsistenciaStatsProps) {
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);

  const {
    data: asistencias,
    isLoading,
    isError,
    error,
  } = useColaboradorAsistencias(correo);

  // Procesar todas las semanas disponibles
  const allWeeks = useMemo<WeekStats[]>(() => {
    if (!asistencias || asistencias.length === 0) {
      return [];
    }
    return processAsistenciasStats(asistencias);
  }, [asistencias]);

  // Filtrar semanas seleccionadas
  const filteredWeeks = useMemo(() => {
    if (selectedWeeks.length === 0) {
      return [];
    }
    return filterWeeksBySelection(allWeeks, selectedWeeks);
  }, [allWeeks, selectedWeeks]);

  const handleWeekToggle = (weekStartISO: string) => {
    setSelectedWeeks((prev) => {
      if (prev.includes(weekStartISO)) {
        // Deseleccionar
        return prev.filter((w) => w !== weekStartISO);
      } else {
        // Seleccionar (ya validado en el componente)
        return [...prev, weekStartISO];
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <div>
              <div className="font-medium">Error al cargar estadísticas</div>
              <div className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Error desconocido"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (allWeeks.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No hay datos de asistencia disponibles
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selector de semanas */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar semanas</CardTitle>
        </CardHeader>
        <CardContent>
          <ColaboradorAsistenciaWeekSelector
            weeks={allWeeks}
            selectedWeeks={selectedWeeks}
            onWeekToggle={handleWeekToggle}
            maxWeeks={MAX_WEEKS}
          />
        </CardContent>
      </Card>

      {/* Gráfica */}
      {selectedWeeks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de puntualidad</CardTitle>
          </CardHeader>
          <CardContent>
            <ColaboradorAsistenciaChart data={filteredWeeks} />
          </CardContent>
        </Card>
      )}

      {selectedWeeks.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Selecciona al menos una semana para ver la gráfica
          </CardContent>
        </Card>
      )}
    </div>
  );
}
