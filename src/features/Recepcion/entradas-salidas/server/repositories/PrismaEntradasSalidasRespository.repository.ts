import { PrismaClient } from "@prisma/client";
import { EntradasSalidasDTO } from "../dtos/EntradasSalidasDto.dto";
import { CreateEntradSalidaArgs } from "../dtos/CreateEntradasSalidas.dto";
import { UpdateEntradaSalidaArgs } from "../dtos/UpdateEntadasSalidas.dto";
import { EntradasSalidasRepository } from "./EntradasSalidasRepository.respository";
import {
  toEntradaSalidaDTO,
  toEntradasSalidasDTOArray,
} from "../mappers/EntradasSalidasMapper.mapper";

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

  findByDestinatario(data: {
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
        ...(updateData.visitante && { visitante: updateData.visitante }),
        ...(updateData.destinatario && { destinatario: updateData.destinatario }),
        ...(updateData.motivo && { motivo: updateData.motivo }),
        ...(updateData.telefono !== undefined && {
          telefono: updateData.telefono ?? null,
        }),
        ...(updateData.correspondencia !== undefined && {
          correspondencia: updateData.correspondencia ?? null,
        }),
        ...(updateData.fecha && { fecha: updateData.fecha }),
        ...(updateData.hora_entrada && { hora_entrada: updateData.hora_entrada }),
        ...(updateData.hora_salida && { hora_salida: updateData.hora_salida }),
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
}
