import { PrismaClient } from "@prisma/client";
import { TryCatch } from "@/core/shared/helpers/tryCatch";
import { AsistenciaDto } from "../Dtos/AsistenciaDto.dto";
import { CreateAsistenciaDto } from "../Dtos/CreateAsistenciaDto.Dto";
import { AsistenciaRepository } from "./AsistenciaRepository.repository";
import {
  AsistenciaWithColaborador,
  toAsistenciaDto,
  toAsistenciatoArray,
} from "../mappers/AsistenciaMapper";

export class PrismaAsistenciaRepository implements AsistenciaRepository {
  constructor(private prisma: PrismaClient) {}

  async delete(_data: { id: string }): Promise<void> {
    //TODO:implementar
    throw new Error("realizar implementacion");
  }

  async getById(_data: { id: string }): Promise<AsistenciaDto> {
    //TODO:implementar
    throw new Error("realizar implementacion");
  }

  async getAll(): Promise<AsistenciaWithColaborador[]> {
    const allAsistencias = await TryCatch(
      this.prisma.asistencia.findMany({
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

    if (!allAsistencias.ok) {
      throw allAsistencias.error;
    }

    if (!allAsistencias.value) {
      throw new Error(`No existen asistencias actualmente`);
    }

    return toAsistenciatoArray(allAsistencias.value);
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

  async getByCorreo(correo: string): Promise<AsistenciaWithColaborador[]> {
    const asistenciasResult = await TryCatch(
      this.prisma.asistencia.findMany({
        where: {
          correo: correo,
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
        orderBy: {
          fecha: "desc",
        },
      }),
    );

    if (!asistenciasResult.ok) {
      throw asistenciasResult.error;
    }

    if (!asistenciasResult.value || asistenciasResult.value.length === 0) {
      return [];
    }

    return asistenciasResult.value;
  }

  async getPaginated(params: import("@/core/shared/types/pagination.types").PaginationParams): Promise<{ data: import("../mappers/AsistenciaMapper").AsistenciaWithColaborador[]; totalCount: number }> {
    const skip = (params.page - 1) * params.pageSize;
    const orderBy = params.sortBy
      ? { [params.sortBy]: params.sortOrder || "desc" }
      : { fecha: "desc" as const };

    const [rawData, totalCount] = await Promise.all([
      this.prisma.asistencia.findMany({
        skip,
        take: params.pageSize,
        orderBy,
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
      this.prisma.asistencia.count(),
    ]);

    return { data: toAsistenciatoArray(rawData), totalCount };
  }
}
