import { PrismaClient } from "@prisma/client";
import {
  FacturaHistorialRepository,
  CreateHistorialArgs,
} from "./FacturaHistorialRepository.repository";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export class PrismaFacturaHistorialRepository
  implements FacturaHistorialRepository
{
  constructor(
    private prisma: PrismaClient | PrismaTransactionClient
  ) {}

  async create(data: CreateHistorialArgs) {
    return await this.prisma.facturaHistorial.create({
      data: {
        facturaId: data.facturaId,
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

    await this.prisma.facturaHistorial.createMany({
      data: data.map((item) => ({
        facturaId: item.facturaId,
        campo: item.campo,
        valorAnterior: item.valorAnterior,
        valorNuevo: item.valorNuevo,
        usuarioId: item.usuarioId,
        motivo: item.motivo,
      })),
    });
  }

  async findByFacturaId(data: { facturaId: string }) {
    return await this.prisma.facturaHistorial.findMany({
      where: { facturaId: data.facturaId },
      orderBy: {
        fechaCambio: "desc",
      },
    });
  }

  async findById(data: { id: string }) {
    return await this.prisma.facturaHistorial.findUnique({
      where: { id: data.id },
    });
  }
}

