"use client";

import { useMemo, useState } from "react";
import { useColaboradorAsistencias } from "../hooks/useColaboradorAsistencias.hook";
import {
  processAsistenciasStats,
  filterWeeksBySelection,
  getAsistenciasByWeekStart,
  type WeekStats,
} from "@/features/RecursosHumanos/asistencias/helpers/processAsistenciasStats";
import { ColaboradorAsistenciaWeekCalendar } from "./ColaboradorAsistenciaWeekCalendar";
import { ColaboradorAsistenciaChart } from "./ColaboradorAsistenciaChart";
import { ColaboradorAsistenciaDetailsDialog } from "./ColaboradorAsistenciaDetailsDialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/shared/ui/card";
import { Spinner } from "@/core/shared/ui/spinner";
import { AlertCircle, ListFilter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/shared/ui/popover";
import { Button } from "@/core/shared/ui/button";

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
  const [selectedWeek, setSelectedWeek] = useState<WeekStats | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleWeeksChange = (weekISOs: string[]) => {
    setSelectedWeeks(weekISOs);
  };

  // Filtrar asistencias de la semana seleccionada para el dialog
  const selectedWeekAsistencias = useMemo(() => {
    if (!selectedWeek || !asistencias) {
      return [];
    }
    return getAsistenciasByWeekStart(selectedWeek.weekStartISO, asistencias);
  }, [selectedWeek, asistencias]);

  const handleWeekClick = (weekStats: WeekStats) => {
    setSelectedWeek(weekStats);
    setIsDialogOpen(true);
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
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger>
              <Button variant={"outline"}>
                <ListFilter strokeWidth={1.5} />
                Seleccionar semanas
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-2xl ml-20">
              <ColaboradorAsistenciaWeekCalendar
                availableWeeks={allWeeks}
                selectedWeeks={selectedWeeks}
                onWeeksChange={handleWeeksChange}
                maxWeeks={MAX_WEEKS}
                initialMonth={new Date()}
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Gráfica */}
      {selectedWeeks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de puntualidad</CardTitle>
          </CardHeader>
          <CardContent>
            <ColaboradorAsistenciaChart
              data={filteredWeeks}
              onWeekClick={handleWeekClick}
            />
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

      {/* Dialog de detalles */}
      <ColaboradorAsistenciaDetailsDialog
        weekStats={selectedWeek}
        asistencias={selectedWeekAsistencias}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
