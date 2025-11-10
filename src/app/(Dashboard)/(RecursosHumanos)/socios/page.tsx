import { SociosTablePage } from "@/features/RecursosHumanos/socios/pages/SociosTablePage";
import { SocioDto } from "@/features/RecursosHumanos/socios/server/dtos/SocioDto.dto";
import { makeSocioService } from "@/features/RecursosHumanos/socios/server/services/makeSocioService";
import prisma from "@/core/lib/prisma";
import { toSocioDtoArray } from "@/features/RecursosHumanos/socios/server/mappers/socioMapper";

const fetchSociosInitialData = async (): Promise<SocioDto[]> => {
  const socioService = makeSocioService({ prisma });
  const result = await socioService.getAll();
  if (!result.ok) {
    throw new Error(result.error.message);
  }

  return toSocioDtoArray(result.value);
};

const SociosPage = async () => {
  const initialSociosData = await fetchSociosInitialData();

  return (
    <>
      <SociosTablePage tableData={initialSociosData} />
    </>
  );
};

export default SociosPage;
