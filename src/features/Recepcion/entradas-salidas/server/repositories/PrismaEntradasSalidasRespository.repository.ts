import { Prisma, PrismaClient } from "@prisma/client";
import { EntradasSalidasDTO } from "../dtos/EntradasSalidasDto.dto";
import { CreateEntradSalidaArgs } from "../dtos/CreateEntradasSalidas.dto";
import { UpdateEntradaSalidaArgs } from "../dtos/UpdateEntadasSalidas.dto";
import { EntradasSalidasRepository } from "./EntradasSalidasRepository.respository";
import {
  toEntradaSalidaDTO,
  toEntradasSalidasDTOArray,
} from "../mappers/EntradasSalidasMapper.mapper";
import { PaginationParams } from "@/core/shared/types/pagination.types";

const ALLOWED_SORT_COLUMNS = new Set([
  "visitante",
  "destinatario",
  "motivo",
  "fecha",
  "hora_entrada",
  "hora_salida",
  "createdAt",
]);

export class PrismaEntradasSalidasRepository
  implements EntradasSalidasRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateEntradSalidaArgs): Promise<EntradasSalidasDTO> {
    const prismaEntradasSalidas = await this.prisma.entradasSalidas.create({
      data: {
        visitante: data.visitante,
        destinatario: data.destinatario,
        motivo: data.motivo,
        telefono: data.telefono ?? null,
        correspondencia: data.correspondencia ?? null,
        fecha: data.fecha,
        hora_entrada: data.hora_entrada,
        hora_salida: data.hora_salida ?? null,
      },
    });

    return toEntradaSalidaDTO(prismaEntradasSalidas);
  }

  async delete(data: { id: string }): Promise<void> {
    await this.prisma.entradasSalidas.delete({
      where: { id: data.id },
    });
  }

  findByDestinatario(_data: {
    correo: string;
  }): Promise<EntradasSalidasDTO | null> {
    throw new Error("Implementar");
  }
  async findById(data: { id: string }): Promise<EntradasSalidasDTO | null> {
    const entradaSalida = await this.prisma.entradasSalidas.findUnique({
      where: { id: data.id },
    });

    if (!entradaSalida) {
      return null;
    }

    return toEntradaSalidaDTO(entradaSalida);
  }
  async getAll(): Promise<EntradasSalidasDTO[]> {
    const entradasSalidas = await this.prisma.entradasSalidas.findMany({
      orderBy: {
        fecha: "desc",
      },
    });

    return toEntradasSalidasDTOArray(entradasSalidas);
  }
  async update(data: UpdateEntradaSalidaArgs): Promise<EntradasSalidasDTO> {
    const { id, ...updateData } = data;

    const prismaEntradasSalidas = await this.prisma.entradasSalidas.update({
      where: { id },
      data: {
        ...(updateData.visitante !== undefined && { visitante: updateData.visitante }),
        ...(updateData.destinatario !== undefined && { destinatario: updateData.destinatario }),
        ...(updateData.motivo !== undefined && { motivo: updateData.motivo }),
        ...(updateData.telefono !== undefined && {
          telefono: updateData.telefono ?? null,
        }),
        ...(updateData.correspondencia !== undefined && {
          correspondencia: updateData.correspondencia ?? null,
        }),
        ...(updateData.fecha !== undefined && { fecha: updateData.fecha }),
        ...(updateData.hora_entrada !== undefined && { hora_entrada: updateData.hora_entrada }),
        ...(updateData.hora_salida !== undefined && { hora_salida: updateData.hora_salida }),
      },
    });

    return toEntradaSalidaDTO(prismaEntradasSalidas);
  }

  async registrarSalida(data: { id: string; hora_salida: Date }): Promise<EntradasSalidasDTO> {
    const prismaEntradasSalidas = await this.prisma.entradasSalidas.update({
      where: { id: data.id },
      data: {
        hora_salida: data.hora_salida,
      },
    });

    return toEntradaSalidaDTO(prismaEntradasSalidas);
  }

  async getPaginated(params: PaginationParams): Promise<{ data: EntradasSalidasDTO[]; totalCount: number }> {
    const skip = (params.page - 1) * params.pageSize;

    const sortColumn = params.sortBy && ALLOWED_SORT_COLUMNS.has(params.sortBy)
      ? params.sortBy
      : undefined;

    const orderBy = sortColumn
      ? { [sortColumn]: params.sortOrder || "desc" }
      : { fecha: "desc" as const };

    const where: Prisma.EntradasSalidasWhereInput = {};
    if (params.search) {
      where.OR = [
        { visitante: { contains: params.search, mode: "insensitive" } },
        { destinatario: { contains: params.search, mode: "insensitive" } },
        { motivo: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [rawData, totalCount] = await Promise.all([
      this.prisma.entradasSalidas.findMany({
        skip,
        take: params.pageSize,
        orderBy,
        where,
      }),
      this.prisma.entradasSalidas.count({ where }),
    ]);

    return { data: toEntradasSalidasDTOArray(rawData), totalCount };
  }
}
