import { makeColaboradorService } from "@/features/RecursosHumanos/colaboradores/server/services/makeColaboradorService";
import { toColaboradorDto } from "@/features/RecursosHumanos/colaboradores/server/mappers/colaboradorMapper";
import prisma from "@/core/lib/prisma";
import { ColaboradorIndividualPage } from "@/features/RecursosHumanos/colaboradores/pages/ColaboradorInividualPage.page";

type Params = Promise<{ colaboradorId: string }>;

interface PageProps {
  params: Params;
}

const getColaborador = async (colaboradorId: string) => {
  const colaboradorService = makeColaboradorService({ prisma });
  const result = await colaboradorService.getById(colaboradorId);

  if (!result.ok) {
    throw new Error(result.error.message);
  }

  // Convertir a DTO para serializar correctamente (Decimal -> string)
  return toColaboradorDto(result.value);
};

export default async function ColaboradorPage({ params }: PageProps) {
  // En Next.js 15, params es una Promise
  const { colaboradorId } = await params;

  // Aquí puedes hacer fetch de los datos del colaborador
  const colaborador = await getColaborador(colaboradorId);

  return <ColaboradorIndividualPage colaborador={colaborador} />;
}
