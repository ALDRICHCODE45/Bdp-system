import { EgresosTablePage } from "@/features/finanzas/egresos/pages/EgresosTablePage";
import { EgresoDto } from "@/features/finanzas/egresos/server/dtos/EgresoDto.dto";
import { makeEgresoService } from "@/features/finanzas/egresos/server/services/makeEgresoService";
import prisma from "@/core/lib/prisma";
import { toEgresoDtoArray } from "@/features/finanzas/egresos/server/mappers/egresoMapper";

const fetchEgresosInitialData = async (): Promise<EgresoDto[]> => {
  const egresoService = makeEgresoService({ prisma });
  const result = await egresoService.getAll();
  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return toEgresoDtoArray(result.value);
};

const EgresosPage = async () => {
  const initialEgresosData = await fetchEgresosInitialData();

  return (
    <>
      <EgresosTablePage tableData={initialEgresosData} />
    </>
  );
};

export default EgresosPage;
