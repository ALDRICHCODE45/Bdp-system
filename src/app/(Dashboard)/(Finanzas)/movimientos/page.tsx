import prisma from "@/core/lib/prisma";
import { MovimientosTablePage } from "@/features/finanzas/movimientos/pages/MovimientosTablePage";
import { makeMovimientoService } from "@/features/finanzas/movimientos/server/services/makeMovimientoService";

export default async function MovimientosPage() {
  const service = makeMovimientoService({ prisma });
  const result = await service.getAll({ page: 1, size: 20, tipo: "ALL" });
  const initialData = result.ok ? result.value : undefined;
  const initialDataUpdatedAt = result.ok ? Date.now() : undefined;

  return (
    <MovimientosTablePage
      initialData={initialData}
      initialDataUpdatedAt={initialDataUpdatedAt}
    />
  );
}
