import { Asistencia, Colaborador } from "@prisma/client";
import { AsistenciaDto } from "../Dtos/AsistenciaDto.dto";

type AsistenciaWithColaborador = Asistencia & {
  colaborador: Pick<Colaborador, "id" | "name" | "correo" | "puesto">;
};

export const toAsistenciaDto = (
  asistenciaEntity: AsistenciaWithColaborador,
): AsistenciaDto => {
  return {
    id: asistenciaEntity.id,
    correo: asistenciaEntity.correo,
    fecha: asistenciaEntity.fecha,
    tipo: asistenciaEntity.tipo,
    colaborador: {
      id: asistenciaEntity.colaborador.id,
      name: asistenciaEntity.colaborador.name,
      correo: asistenciaEntity.colaborador.correo,
      puesto: asistenciaEntity.colaborador.puesto,
    },
  };
};
