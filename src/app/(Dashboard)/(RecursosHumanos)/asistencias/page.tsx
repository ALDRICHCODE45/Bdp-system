import { makeAsistenciaService } from "@/features/RecursosHumanos/asistencias/server/services/makeAsistenciaService";
import { AsistenciaColaboradoresTablePage } from "@/features/RecursosHumanos/colaboradores/pages/AsistenciaColaboradoresTablePage";
import prisma from "@/core/lib/prisma";
import { toAsistenciatoArray } from "@/features/RecursosHumanos/asistencias/server/mappers/AsistenciaMapper";

const fetchAllAsistencias = async () => {
  const asistenciaService = makeAsistenciaService({ prisma });

  const result = await asistenciaService.getAll();
  if (!result.ok) {
    throw new Error(result.error.message);
  }

  // Convertir a DTO para serializar correctamente (Decimal -> string)
  return toAsistenciatoArray(result.value);
};

const AsistenciaColaboradorPage = async () => {
  const initialData = await fetchAllAsistencias();

  return (
    <>
      <AsistenciaColaboradoresTablePage initialData={initialData} />
    </>
  );
};

export default AsistenciaColaboradorPage;
