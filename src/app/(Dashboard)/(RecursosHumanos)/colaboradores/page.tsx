import { ColaboradoresTablePage } from "@/features/RecursosHumanos/colaboradores/pages/ColaboradoresTablePage";
import { makeColaboradorService } from "@/features/RecursosHumanos/colaboradores/server/services/makeColaboradorService";
import { toColaboradorDtoArray } from "@/features/RecursosHumanos/colaboradores/server/mappers/colaboradorMapper";
import prisma from "@/core/lib/prisma";
import { ColaboradorDto } from "@/features/RecursosHumanos/colaboradores/server/dtos/ColaboradorDto.dto";

const fetchColaboradoresInitialData = async (): Promise<ColaboradorDto[]> => {
  const colaboradorService = makeColaboradorService({ prisma });
  const result = await colaboradorService.getAll();
  if (!result.ok) {
    throw new Error(result.error.message);
  }

  // Convertir a DTO para serializar correctamente (Decimal -> string)
  return toColaboradorDtoArray(result.value);
};

const ColaboradoresPage = async () => {
  const colaboradores = await fetchColaboradoresInitialData();

  return (
    <>
      <ColaboradoresTablePage tableData={colaboradores} />
    </>
  );
};

export default ColaboradoresPage;
