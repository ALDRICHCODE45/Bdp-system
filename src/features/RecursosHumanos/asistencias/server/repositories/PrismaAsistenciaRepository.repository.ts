import { PrismaClient } from "@prisma/client";
import { TryCatch } from "@/core/shared/helpers/tryCatch";
import { AsistenciaDto } from "../Dtos/AsistenciaDto.dto";
import { CreateAsistenciaDto } from "../Dtos/CreateAsistenciaDto.Dto";
import { AsistenciaRepository } from "./AsistenciaRepository.repository";
import { toAsistenciaDto } from "../mappers/AsistenciaMapper";

export class PrismaAsistenciaRepository implements AsistenciaRepository {
  constructor(private prisma: PrismaClient) { }

  async delete(data: { id: string }): Promise<void> {
    //TODO:implementar
    throw new Error("realizar implementacion");
  }

  async getById(data: { id: string }): Promise<AsistenciaDto> {
    //TODO:implementar
    throw new Error("realizar implementacion");
  }

  async create(data: CreateAsistenciaDto): Promise<AsistenciaDto> {
    const colaboradorResult = await TryCatch(
      this.prisma.colaborador.findUnique({
        where: { correo: data.correo },
      }),
    );

    if (!colaboradorResult.ok) {
      throw colaboradorResult.error;
    }

    if (!colaboradorResult.value) {
      throw new Error(`No existe un colaborador con el correo: ${data.correo}`);
    }

    const asistenciaResult = await TryCatch(
      this.prisma.asistencia.create({
        data: {
          tipo: data.tipo,
          fecha: data.fecha,
          correo: data.correo,
        },
        include: {
          colaborador: {
            select: {
              id: true,
              name: true,
              correo: true,
              puesto: true,
            },
          },
        },
      }),
    );

    if (!asistenciaResult.ok) {
      throw asistenciaResult.error;
    }

    return toAsistenciaDto(asistenciaResult.value);
  }
}
