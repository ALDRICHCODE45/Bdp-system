"use client";

import { Checkbox } from "@/core/shared/ui/checkbox";
import { Card } from "@/core/shared/ui/card";
import { WeekStats } from "@/features/RecursosHumanos/asistencias/helpers/processAsistenciasStats";
import { Badge } from "@/core/shared/ui/badge";
import { cn } from "@/core/lib/utils";

interface ColaboradorAsistenciaWeekSelectorProps {
  weeks: WeekStats[];
  selectedWeeks: string[];
  onWeekToggle: (weekStartISO: string) => void;
  maxWeeks: number;
}

/**
 * Componente para seleccionar semanas (máximo 6)
 */
export function ColaboradorAsistenciaWeekSelector({
  weeks,
  selectedWeeks,
  onWeekToggle,
  maxWeeks,
}: ColaboradorAsistenciaWeekSelectorProps) {
  const isSelected = (weekStartISO: string) =>
    selectedWeeks.includes(weekStartISO);

  const canSelectMore = selectedWeeks.length < maxWeeks;

  const handleToggle = (weekStartISO: string) => {
    if (isSelected(weekStartISO)) {
      // Deseleccionar siempre está permitido
      onWeekToggle(weekStartISO);
    } else {
      // Solo seleccionar si no se ha alcanzado el límite
      if (canSelectMore) {
        onWeekToggle(weekStartISO);
      }
    }
  };

  if (weeks.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No hay semanas disponibles
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          Selecciona hasta {maxWeeks} semanas
        </div>
        <Badge variant="outline" className="text-xs">
          {selectedWeeks.length}/{maxWeeks} seleccionadas
        </Badge>
      </div>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
        {weeks.map((week) => {
          const selected = isSelected(week.weekStartISO);
          const disabled = !selected && !canSelectMore;

          return (
            <Card
              key={week.weekStartISO}
              className={cn(
                "cursor-pointer transition-colors",
                selected && "border-primary bg-primary/5",
                disabled && "cursor-not-allowed opacity-50"
              )}
              onClick={() => !disabled && handleToggle(week.weekStartISO)}
            >
              <div className="flex items-start gap-3 p-4">
                <Checkbox
                  checked={selected}
                  disabled={disabled}
                  onCheckedChange={() => handleToggle(week.weekStartISO)}
                  className="mt-0.5"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{week.weekRange}</div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        week.color === "green" && "border-green-500 text-green-700 dark:text-green-400",
                        week.color === "yellow" && "border-yellow-500 text-yellow-700 dark:text-yellow-400",
                        week.color === "red" && "border-red-500 text-red-700 dark:text-red-400"
                      )}
                    >
                      {week.tardanzas}{" "}
                      {week.tardanzas === 1 ? "tardanza" : "tardanzas"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Semana del {week.weekLabel}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

