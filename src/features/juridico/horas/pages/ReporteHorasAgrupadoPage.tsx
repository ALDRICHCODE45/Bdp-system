"use client";

import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { ReporteHorasAgrupadoView } from "../components/ReporteHorasAgrupadoView";
import { ReporteHorasAgrupadoProvider } from "../components/ReporteHorasAgrupadoProvider";

export function ReporteHorasAgrupadoPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">
          Reporte Agrupado de Horas Jurídicas
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Horas agrupadas por abogado, cliente, asunto y periodo — server-side
          paginado con subtotales y exportación.
        </p>
      </div>

      <PermissionGuard
        permissions={[
          PermissionActions["juridico-horas"]["ver-reportes"],
          PermissionActions["juridico-horas"].gestionar,
        ]}
        fallback={
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No tienes permisos para ver el reporte de horas agrupadas.
            </p>
          </div>
        }
      >
        <ReporteHorasAgrupadoProvider>
          <ReporteHorasAgrupadoView />
        </ReporteHorasAgrupadoProvider>
      </PermissionGuard>
    </div>
  );
}
