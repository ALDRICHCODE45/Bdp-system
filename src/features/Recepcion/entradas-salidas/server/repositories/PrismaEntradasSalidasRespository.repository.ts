import { PrismaClient } from "@prisma/client";
import { EntradasSalidasDTO } from "../dtos/EntradasSalidasDto.dto";
import { CreateEntradSalidaArgs } from "../dtos/CreateEntradasSalidas.dto";
import { EntradasSalidasRepository } from "./EntradasSalidasRepository.respository";
import { toEntradaSalidaDTO } from "../mappers/EntradasSalidasMapper.mapper";

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
        hora_salida: data.hora_salida,
      },
    });

    return toEntradaSalidaDTO(prismaEntradasSalidas);
  }

  delete(data: { id: string }): Promise<void> {
    throw new Error("Implementar");
  }

  findByDestinatario(data: {
    correo: string;
  }): Promise<EntradasSalidasDTO | null> {
    throw new Error("Implementar");
  }
  findById(data: { id: string }): Promise<EntradasSalidasDTO | null> {
    throw new Error("Implementar");
  }
  getAll(): Promise<EntradasSalidasDTO[]> {
    throw new Error("Implementar");
  }
  update(
    data: Partial<{
      id: string;
      visitante: string;
      destinatario: string;
      motivo: string;
      telefono: string;
      correspondencia: string;
      fecha: Date;
      hora_entrada: Date;
      hora_salida: Date;
    }>
  ): Promise<EntradasSalidasDTO> {
    throw new Error("Implementar");
  }
}
