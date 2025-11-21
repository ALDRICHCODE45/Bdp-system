import { PrismaClient } from "@prisma/client";
import {
  IngresoHistorialRepository,
  CreateHistorialArgs,
} from "./IngresoHistorialRepository.repository";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export class PrismaIngresoHistorialRepository
  implements IngresoHistorialRepository
{
  constructor(
    private prisma: PrismaClient | PrismaTransactionClient
  ) {}

  async create(data: CreateHistorialArgs) {
    return await this.prisma.ingresoHistorial.create({
      data: {
        ingresoId: data.ingresoId,
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

    await this.prisma.ingresoHistorial.createMany({
      data: data.map((item) => ({
        ingresoId: item.ingresoId,
        campo: item.campo,
        valorAnterior: item.valorAnterior,
        valorNuevo: item.valorNuevo,
        usuarioId: item.usuarioId,
        motivo: item.motivo,
      })),
    });
  }

  async findByIngresoId(data: { ingresoId: string }) {
    return await this.prisma.ingresoHistorial.findMany({
      where: { ingresoId: data.ingresoId },
      orderBy: {
        fechaCambio: "desc",
      },
    });
  }

  async findById(data: { id: string }) {
    return await this.prisma.ingresoHistorial.findUnique({
      where: { id: data.id },
    });
  }
}

