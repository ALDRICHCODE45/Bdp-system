import { PrismaClient } from "@prisma/client";
import {
  EgresoHistorialRepository,
  CreateHistorialArgs,
} from "./EgresoHistorialRepository.repository";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export class PrismaEgresoHistorialRepository
  implements EgresoHistorialRepository
{
  constructor(
    private prisma: PrismaClient | PrismaTransactionClient
  ) {}

  async create(data: CreateHistorialArgs) {
    return await this.prisma.egresoHistorial.create({
      data: {
        egresoId: data.egresoId,
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

    await this.prisma.egresoHistorial.createMany({
      data: data.map((item) => ({
        egresoId: item.egresoId,
        campo: item.campo,
        valorAnterior: item.valorAnterior,
        valorNuevo: item.valorNuevo,
        usuarioId: item.usuarioId,
        motivo: item.motivo,
      })),
    });
  }

  async findByEgresoId(data: { egresoId: string }) {
    return await this.prisma.egresoHistorial.findMany({
      where: { egresoId: data.egresoId },
      orderBy: {
        fechaCambio: "desc",
      },
    });
  }

  async findById(data: { id: string }) {
    return await this.prisma.egresoHistorial.findUnique({
      where: { id: data.id },
    });
  }
}

