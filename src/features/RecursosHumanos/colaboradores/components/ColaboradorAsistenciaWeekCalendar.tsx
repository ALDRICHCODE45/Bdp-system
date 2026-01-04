"use client";

import { useMemo, useState } from "react";
import { WeekCalendar } from "@/core/shared/ui/weekly-calendar/WeeklyCalendar";
import {
  WeekStats,
  getWeekStatsForWeekStart,
} from "@/features/RecursosHumanos/asistencias/helpers/processAsistenciasStats";
import {
  getWeekStartMonday,
  getWeekStartSunday,
  normalizeWeekISO,
} from "@/features/RecursosHumanos/asistencias/helpers/weekConversion";
import { Badge } from "@/core/shared/ui/badge";
import { cn } from "@/core/lib/utils";

interface ColaboradorAsistenciaWeekCalendarProps {
  availableWeeks: WeekStats[]; // Semanas con datos (lunes como inicio)
  selectedWeeks: string[]; // ISO strings de semanas seleccionadas (lunes)
  onWeeksChange: (weekISOs: string[]) => void;
  maxWeeks?: number;
  initialMonth?: Date;
}

/**
 * Componente que integra WeeklyCalendar con la lógica de estadísticas de asistencia
 * Maneja la conversión entre domingo (UI) y lunes (datos)
 */
export function ColaboradorAsistenciaWeekCalendar({
  availableWeeks,
  selectedWeeks,
  onWeeksChange,
  maxWeeks = 6,
  initialMonth = new Date(),
}: ColaboradorAsistenciaWeekCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  // Convertir semanas seleccionadas (lunes) a domingo para el calendario
  const selectedWeeksSunday = useMemo(() => {
    return selectedWeeks.map((weekISO) => {
      const weekStartMonday = new Date(weekISO);
      return getWeekStartSunday(weekStartMonday);
    });
  }, [selectedWeeks]);

  // Manejar cambio de selección desde el calendario
  const handleSelectChange = (selectedSundays: Date[]) => {
    // Convertir de domingo (UI) a lunes (datos) y luego a ISO strings
    const newSelectedMondays = selectedSundays.map((sunday) => {
      const monday = getWeekStartMonday(sunday);
      return normalizeWeekISO(monday, 1);
    });
    onWeeksChange(newSelectedMondays);
  };

  // Función helper para obtener estadísticas de una semana (si tiene datos)
  const getWeekStats = (weekStartSunday: Date): WeekStats | null => {
    const weekStartMonday = getWeekStartMonday(weekStartSunday);
    return getWeekStatsForWeekStart(weekStartMonday, availableWeeks);
  };

  // Renderizar badge con información de tardanzas si la semana tiene datos
  const renderWeekBadge = (weekStart: Date) => {
    const stats = getWeekStats(weekStart);

    if (!stats) {
      return null;
    }

    return (
      <Badge
        variant="outline"
        className={cn(
          "text-xs ml-2",
          stats.color === "green" &&
            "border-green-500 text-green-700 dark:text-green-400",
          stats.color === "yellow" &&
            "border-yellow-500 text-yellow-700 dark:text-yellow-400",
          stats.color === "red" &&
            "border-red-500 text-red-700 dark:text-red-400"
        )}
      >
        {stats.tardanzas} {stats.tardanzas === 1 ? "tardanza" : "tardanzas"}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Contador de selección */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          Selecciona hasta {maxWeeks} semanas
        </div>
        <Badge variant="outline" className="text-xs">
          {selectedWeeks.length}/{maxWeeks} seleccionadas
        </Badge>
      </div>

      {/* Calendario */}
      <WeekCalendar
        selected={selectedWeeksSunday}
        onSelectChange={handleSelectChange}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        maxSelections={maxWeeks}
        renderWeekBadge={renderWeekBadge}
        className="w-full"
      />
    </div>
  );
}
