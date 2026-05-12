import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/core/shared/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/core/shared/ui/chart";
import { formatHoras } from "../../helpers/formatHoras";

type Row = { nombre: string; email: string; horas: number; registros: number };

const chartConfig = {
  horas: { label: "Horas", color: "var(--color-chart-2)" },
} satisfies ChartConfig;

export function DashboardHorasPorUsuarioChart({
  data,
  isLoading,
}: {
  data: Row[];
  isLoading: boolean;
}) {
  if (isLoading) return <Skeleton className="h-[320px] rounded-xl" />;

  const chartData = data.slice(0, 10).map((item) => ({
    ...item,
    nombre: item.nombre.length > 22 ? `${item.nombre.slice(0, 22)}…` : item.nombre,
  }));

  return (
    <div className="rounded-xl border bg-card shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">Horas por Usuario</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Top 10 abogados por horas registradas</p>
      </div>
      <ChartContainer config={chartConfig} className="h-[320px] w-full !aspect-auto">
        <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 8 }}>
          <CartesianGrid horizontal={false} />
          <YAxis dataKey="nombre" type="category" width={140} tickLine={false} axisLine={false} />
          <XAxis dataKey="horas" type="number" tickLine={false} axisLine={false} />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                formatter={(value, _name, item) => {
                  const payload = item.payload as Row;
                  return (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{payload.nombre}</span>
                      <span className="text-muted-foreground text-xs">{payload.email}</span>
                      <span className="font-mono">{formatHoras(Number(value))}</span>
                    </div>
                  );
                }}
              />
            }
          />
          <Bar dataKey="horas" fill="var(--color-horas)" radius={6} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
