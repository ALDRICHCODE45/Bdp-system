import { EntradasYSalidasTablePage } from "@/features/Recepcion/entradas-salidas/pages/EntradasSalidasTablePage";
import { makeEntradasSalidasService } from "@/features/Recepcion/entradas-salidas/server/services/makeEntradasSalidasService";
import prisma from "@/core/lib/prisma";
import { EntradasSalidasDTO } from "@/features/Recepcion/entradas-salidas/server/dtos/EntradasSalidasDto.dto";

const fetchEntradasSalidasInitialData = async (): Promise<EntradasSalidasDTO[]> => {
  const entradasSalidasService = makeEntradasSalidasService({ prisma });
  const result = await entradasSalidasService.getAll();
  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return result.value;
};

const EntradasYSalidasPage = async () => {
  const entradasSalidas = await fetchEntradasSalidasInitialData();

  return (
    <>
      <EntradasYSalidasTablePage tableData={entradasSalidas} />
    </>
  );
};
export default EntradasYSalidasPage;
