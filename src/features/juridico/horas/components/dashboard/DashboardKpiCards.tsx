import { Building2, Clock, FileText, Users } from "lucide-react";
import { Skeleton } from "@/core/shared/ui/skeleton";
import { formatHoras } from "../../helpers/formatHoras";

type DashboardKpiCardsProps = {
  isLoading: boolean;
  totalHoras: number;
  totalRegistros: number;
  totalUsuarios: number;
  totalClientes: number;
};

function KpiSkeleton() {
  return <Skeleton className="h-[128px] rounded-xl" />;
}

export function DashboardKpiCards({
  isLoading,
  totalHoras,
  totalRegistros,
  totalUsuarios,
  totalClientes,
}: DashboardKpiCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
      <div className="rounded-xl border bg-card shadow-sm p-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 shrink-0">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Horas</div>
            <div className="text-2xl font-bold tabular-nums">{formatHoras(totalHoras)}</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm p-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 shrink-0">
            <FileText className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total Registros</div>
            <div className="text-2xl font-bold tabular-nums">{totalRegistros.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm p-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-violet-50 dark:bg-violet-950/50 shrink-0">
            <Users className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Usuarios Activos</div>
            <div className="text-2xl font-bold tabular-nums">{totalUsuarios.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm p-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 shrink-0">
            <Building2 className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Clientes Atendidos</div>
            <div className="text-2xl font-bold tabular-nums">{totalClientes.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
