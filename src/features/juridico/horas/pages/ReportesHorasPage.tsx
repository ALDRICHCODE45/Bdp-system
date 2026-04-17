"use client";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { ReportesHorasView } from "../components/ReportesHorasView";

export function ReportesHorasPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reportes de Horas</h1>
        <p className="text-muted-foreground">
          Vista administrativa de horas registradas
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
              No tienes permisos para ver los reportes de horas.
            </p>
          </div>
        }
      >
        <ReportesHorasView />
      </PermissionGuard>
    </div>
  );
}
