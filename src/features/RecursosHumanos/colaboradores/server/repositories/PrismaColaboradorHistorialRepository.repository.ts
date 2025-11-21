import { PrismaClient } from "@prisma/client";
import {
  ColaboradorHistorialRepository,
  CreateHistorialArgs,
} from "./ColaboradorHistorialRepository.repository";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export class PrismaColaboradorHistorialRepository
  implements ColaboradorHistorialRepository
{
  constructor(
    private prisma: PrismaClient | PrismaTransactionClient
  ) {}

  async create(data: CreateHistorialArgs) {
    return await this.prisma.colaboradorHistorial.create({
      data: {
        colaboradorId: data.colaboradorId,
        campo: data.campo,
        valorAnterior: data.valorAnterior,
        valorNuevo: data.valorNuevo,
        usuarioId: data.usuarioId,
        motivo: data.motivo,
      },
    });
  }

  async createMany(data: CreateHistorialArgs[]): Promise<void> {
    if (data.length === 0) {
      return;
    }

    await this.prisma.colaboradorHistorial.createMany({
      data: data.map((item) => ({
        colaboradorId: item.colaboradorId,
        campo: item.campo,
        valorAnterior: item.valorAnterior,
        valorNuevo: item.valorNuevo,
        usuarioId: item.usuarioId,
        motivo: item.motivo,
      })),
    });
  }

  async findByColaboradorId(data: {
    colaboradorId: string;
  }) {
    return await this.prisma.colaboradorHistorial.findMany({
      where: { colaboradorId: data.colaboradorId },
      orderBy: {
        fechaCambio: "desc",
      },
    });
  }

  async findById(data: { id: string }) {
    return await this.prisma.colaboradorHistorial.findUnique({
      where: { id: data.id },
    });
  }
}

