import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/core/shared/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/core/shared/ui/chart";
import { formatHoras } from "../../helpers/formatHoras";

type Row = { semana: number; ano: number; horas: number; registros: number };

const chartConfig = {
  horas: { label: "Horas", color: "var(--color-chart-3)" },
} satisfies ChartConfig;

export function DashboardTendenciaSemanalChart({
  data,
  isLoading,
}: {
  data: Row[];
  isLoading: boolean;
}) {
  if (isLoading) return <Skeleton className="h-[320px] rounded-xl" />;

  const chartData = data.map((item) => ({
    ...item,
    etiqueta: `S${item.semana}-${item.ano}`,
  }));

  return (
    <div className="rounded-xl border bg-card shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">Tendencia Semanal</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Evolución de horas semana a semana</p>
      </div>
      <ChartContainer config={chartConfig} className="h-[320px] w-full !aspect-auto">
        <AreaChart data={chartData} margin={{ left: 8, right: 8 }}>
          <defs>
            <linearGradient id="dashboardHorasFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-horas)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--color-horas)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis tickLine={false} axisLine={false} />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                formatter={(value) => formatHoras(Number(value))}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="horas"
            stroke="var(--color-horas)"
            fill="url(#dashboardHorasFill)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
