"use client";

import { BarChart3 } from "lucide-react";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { DashboardHorasView } from "../components/dashboard/DashboardHorasView";

export function DashboardHorasPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard Analítico de Horas</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Visualización consolidada de productividad y carga operativa del área jurídica.
        </p>
      </div>

      <PermissionGuard
        permissions={[PermissionActions["juridico-horas"].gestionar]}
        fallback={
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No tenés permisos para ver el dashboard de horas.
            </p>
          </div>
        }
      >
        <DashboardHorasView />
      </PermissionGuard>
    </div>
  );
}
