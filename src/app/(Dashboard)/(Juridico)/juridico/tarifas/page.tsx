import { TarifasAbogadoAsuntoTablePage } from "@/features/juridico/tarifas/pages/TarifasAbogadoAsuntoTablePage";
import { PermissionGuard } from "@/core/shared/components/PermissionGuard";
import { PermissionActions } from "@/core/lib/permissions/permission-actions";
import { Landmark } from "lucide-react";

export default function TarifasPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="mb-4 sm:mb-6 flex items-center gap-2">
        <Landmark className="h-6 w-6 text-muted-foreground" />
        <h1 className="text-xl sm:text-2xl font-bold">Tarifas Jurídicas</h1>
      </div>
      <PermissionGuard
        permissions={[PermissionActions["juridico-tarifas"].gestionar]}
      >
        <TarifasAbogadoAsuntoTablePage />
      </PermissionGuard>
    </div>
  );
}
