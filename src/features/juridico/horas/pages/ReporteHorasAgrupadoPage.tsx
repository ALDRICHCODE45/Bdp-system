"use client";

import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { TablePresentation } from "@/core/shared/components/DataTable/TablePresentation";
import { ReporteHorasAgrupadoView } from "../components/ReporteHorasAgrupadoView";
import { ReporteHorasAgrupadoProvider } from "../components/ReporteHorasAgrupadoProvider";

export function ReporteHorasAgrupadoPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <TablePresentation
        title="Reporte de Horas Agrupado"
        subtitle="Horas agrupadas por abogado, cliente, asunto y periodo — server-side paginado con subtotales y exportación."
      />

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
