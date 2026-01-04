"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/core/shared/ui/chart";
import { WeekStats } from "@/features/RecursosHumanos/asistencias/helpers/processAsistenciasStats";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ColaboradorAsistenciaChartProps {
  data: WeekStats[];
  onWeekClick?: (weekStats: WeekStats) => void;
}

/**
 * Configuración de colores para la gráfica
 */
const chartConfig: ChartConfig = {
  tardanzas: {
    label: "Llegadas tarde",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

/**
 * Obtiene el color HSL según el tipo de color
 */
function getColorHSL(color: "green" | "yellow" | "red"): string {
  switch (color) {
    case "green":
      return "hsl(142, 71%, 45%)";
    case "yellow":
      return "hsl(38, 92%, 50%)";
    case "red":
      return "hsl(0, 84%, 60%)";
    default:
      return "hsl(var(--chart-1))";
  }
}

/**
 * Componente de gráfica de barras para mostrar estadísticas de asistencia
 */
export function ColaboradorAsistenciaChart({
  data,
  onWeekClick,
}: ColaboradorAsistenciaChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No hay datos para mostrar
      </div>
    );
  }

  // Transformar datos para la gráfica, manteniendo referencia a WeekStats
  const chartData = data.map((week) => ({
    week: format(week.weekStart, "dd/MM", { locale: es }),
    weekRange: week.weekRange,
    tardanzas: week.tardanzas,
    color: week.color,
    weekStats: week, // Mantener referencia completa para el click
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 12,
          right: 12,
          top: 12,
          bottom: 12,
        }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="week"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          allowDecimals={false}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value, payload) => {
                const data = payload?.[0]?.payload as
                  | { weekRange: string }
                  | undefined;
                return data?.weekRange || value;
              }}
              formatter={(value) => [
                `${value} ${Number(value) === 1 ? "llegada tarde" : "llegadas tarde"}`,
                "Tardanzas",
              ]}
            />
          }
        />
        <Bar
          dataKey="tardanzas"
          radius={[4, 4, 0, 0]}
          onClick={(data: any, index: number) => {
            if (onWeekClick && chartData[index]?.weekStats) {
              onWeekClick(chartData[index].weekStats);
            }
          }}
          cursor={onWeekClick ? "pointer" : "default"}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={getColorHSL(entry.color)}
            />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

