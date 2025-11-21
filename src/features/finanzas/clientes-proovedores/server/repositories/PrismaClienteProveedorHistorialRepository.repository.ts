import { PrismaClient } from "@prisma/client";
import {
  ClienteProveedorHistorialRepository,
  CreateHistorialArgs,
} from "./ClienteProveedorHistorialRepository.repository";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export class PrismaClienteProveedorHistorialRepository
  implements ClienteProveedorHistorialRepository
{
  constructor(
    private prisma: PrismaClient | PrismaTransactionClient
  ) {}

  async create(data: CreateHistorialArgs) {
    return await this.prisma.clienteProveedorHistorial.create({
      data: {
        clienteProveedorId: data.clienteProveedorId,
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

    await this.prisma.clienteProveedorHistorial.createMany({
      data: data.map((item) => ({
        clienteProveedorId: item.clienteProveedorId,
        campo: item.campo,
        valorAnterior: item.valorAnterior,
        valorNuevo: item.valorNuevo,
        usuarioId: item.usuarioId,
        motivo: item.motivo,
      })),
    });
  }

  async findByClienteProveedorId(data: {
    clienteProveedorId: string;
  }) {
    return await this.prisma.clienteProveedorHistorial.findMany({
      where: { clienteProveedorId: data.clienteProveedorId },
      orderBy: {
        fechaCambio: "desc",
      },
    });
  }

  async findById(data: { id: string }) {
    return await this.prisma.clienteProveedorHistorial.findUnique({
      where: { id: data.id },
    });
  }
}

