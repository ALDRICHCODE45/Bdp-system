import { IngresosTablePage } from "@/features/finanzas/ingresos/pages/IngresosTablePage";
import { IngresoDto } from "@/features/finanzas/ingresos/server/dtos/IngresoDto.dto";
import { makeIngresoService } from "@/features/finanzas/ingresos/server/services/makeIngresoService";
import prisma from "@/core/lib/prisma";
import { toIngresoDtoArray } from "@/features/finanzas/ingresos/server/mappers/ingresoMapper";

const fetchIngresosInitialData = async (): Promise<IngresoDto[]> => {
  const ingresoService = makeIngresoService({ prisma });
  const result = await ingresoService.getAll();
  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return toIngresoDtoArray(result.value);
};

const IngresosPage = async () => {
  const initialIngresosData = await fetchIngresosInitialData();

  return (
    <>
      <IngresosTablePage tableData={initialIngresosData} />
    </>
  );
};

export default IngresosPage;
