"use client";

import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { Button } from "../button";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface WeekCalendarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  selected: Date[];
  onSelectChange?: (dates: Date[]) => void;
  month?: Date;
  onMonthChange?: (date: Date) => void;
  maxSelections?: number;
  renderWeekBadge?: (weekStart: Date) => React.ReactNode;
}

// Helper function to get the start of a week (Sunday)
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  // Reset hours to start of day for consistent comparison
  d.setHours(0, 0, 0, 0);
  return d;
}

// Helper function to get all weeks in a month
function getWeeksInMonth(date: Date): Date[][] {
  const year = date.getFullYear();
  const month = date.getMonth();

  // First day of the month
  const firstDay = new Date(year, month, 1);
  firstDay.setHours(0, 0, 0, 0);
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  lastDay.setHours(23, 59, 59, 999);

  const weeks: Date[][] = [];
  let currentWeekStart = getStartOfWeek(firstDay);
  let iterations = 0;
  const maxIterations = 6; // Máximo 6 semanas en un mes

  // Get all weeks that include days from this month
  while (iterations < maxIterations) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      day.setHours(0, 0, 0, 0);
      week.push(day);
    }

    // Only include weeks that have at least one day in the current month
    const hasMonthDay = week.some((d) => d.getMonth() === month);
    if (hasMonthDay) {
      weeks.push(week);
    }

    // Move to next week
    currentWeekStart = new Date(currentWeekStart);
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    currentWeekStart.setHours(0, 0, 0, 0);

    iterations++;

    // Si la semana actual ya no tiene días del mes y es posterior al último día, terminar
    if (
      !hasMonthDay &&
      currentWeekStart > lastDay &&
      currentWeekStart.getMonth() !== month
    ) {
      break;
    }
  }

  return weeks;
}

function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function WeekCalendar({
  className,
  selected,
  onSelectChange,
  month = new Date(),
  onMonthChange,
  maxSelections = 6,
  renderWeekBadge,
  ...props
}: WeekCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(month);

  // Sincronizar el estado interno cuando la prop month cambia
  React.useEffect(() => {
    setCurrentMonth(month);
  }, [month]);

  const weeks = React.useMemo(
    () => getWeeksInMonth(currentMonth),
    [currentMonth]
  );

  const handlePreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const handleWeekClick = (weekStart: Date) => {
    // Normalizar la fecha de inicio de semana
    const normalizedWeekStart = new Date(weekStart);
    normalizedWeekStart.setHours(0, 0, 0, 0);

    // Verificar si ya está seleccionada
    const isSelected = selected.some((date) => {
      const normalizedSelected = getStartOfWeek(date);
      normalizedSelected.setHours(0, 0, 0, 0);
      return normalizedSelected.getTime() === normalizedWeekStart.getTime();
    });

    if (isSelected) {
      // Deseleccionar: remover del array
      const newSelected = selected.filter((date) => {
        const normalizedSelected = getStartOfWeek(date);
        normalizedSelected.setHours(0, 0, 0, 0);
        return normalizedSelected.getTime() !== normalizedWeekStart.getTime();
      });
      onSelectChange?.(newSelected);
    } else {
      // Seleccionar: agregar al array si hay espacio
      if (selected.length < maxSelections) {
        const newSelected = [...selected, normalizedWeekStart];
        onSelectChange?.(newSelected);
      }
    }
  };

  const isWeekSelected = (weekStart: Date): boolean => {
    if (!selected || selected.length === 0) return false;

    const normalizedWeekStart = new Date(weekStart);
    normalizedWeekStart.setHours(0, 0, 0, 0);

    return selected.some((date) => {
      const normalizedSelected = getStartOfWeek(date);
      normalizedSelected.setHours(0, 0, 0, 0);
      return normalizedSelected.getTime() === normalizedWeekStart.getTime();
    });
  };

  const canSelectMore = selected.length < maxSelections;

  const monthName = format(currentMonth, "MMMM yyyy", { locale: es });

  return (
    <div
      className={cn("bg-background p-4 rounded-lg border", className)}
      {...props}
    >
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousMonth}
          className="size-8"
        >
          <ChevronLeftIcon className="size-4" />
        </Button>

        <h2 className="text-sm font-medium select-none">{monthName}</h2>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="size-8"
        >
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>

      {/* Week numbers header */}
      <div className="space-y-2">
        {weeks.map((week, index) => {
          const weekStart = week[0];
          const weekEnd = week[6];
          const weekNum = getWeekNumber(weekStart);
          const isSelected = isWeekSelected(weekStart);
          const currentMonthDays = week.filter(
            (d) => d.getMonth() === currentMonth.getMonth()
          );

          const isDisabled = !isSelected && !canSelectMore;

          return (
            <button
              key={index}
              onClick={() => handleWeekClick(weekStart)}
              disabled={isDisabled}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected &&
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                isDisabled && "cursor-not-allowed opacity-50"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isSelected
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  Semana {weekNum}
                </span>
                <span className="text-sm">
                  {weekStart.getDate()} - {weekEnd.getDate()}{" "}
                  {weekEnd.getMonth() !== weekStart.getMonth() &&
                    weekEnd.getMonth() !== weekStart.getMonth() &&
                    format(weekEnd, "MMM", { locale: es })}
                </span>
                {renderWeekBadge && renderWeekBadge(weekStart)}
              </div>
              <span
                className={cn(
                  "text-xs",
                  isSelected
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                )}
              >
                {currentMonthDays.length}{" "}
                {currentMonthDays.length === 1 ? "día" : "días"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { WeekCalendar, getStartOfWeek, getWeeksInMonth };
