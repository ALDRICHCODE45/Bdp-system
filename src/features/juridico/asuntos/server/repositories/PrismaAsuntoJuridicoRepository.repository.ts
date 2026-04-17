import { PrismaClient } from "@prisma/client";
import type {
  AsuntoJuridicoRepository,
  AsuntoJuridicoEntity,
  CreateAsuntoJuridicoArgs,
  UpdateAsuntoJuridicoArgs,
} from "./AsuntoJuridicoRepository.repository";

const asuntoIncludes = {
  clienteJuridico: { select: { id: true, nombre: true } },
  socio: { select: { id: true, nombre: true } },
} as const;

export class PrismaAsuntoJuridicoRepository
  implements AsuntoJuridicoRepository
{
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateAsuntoJuridicoArgs): Promise<AsuntoJuridicoEntity> {
    return await this.prisma.asuntoJuridico.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
        clienteJuridicoId: data.clienteJuridicoId,
        socioId: data.socioId,
      },
      include: asuntoIncludes,
    });
  }

  async update(data: UpdateAsuntoJuridicoArgs): Promise<AsuntoJuridicoEntity> {
    return await this.prisma.asuntoJuridico.update({
      where: { id: data.id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
        clienteJuridicoId: data.clienteJuridicoId,
        socioId: data.socioId,
        estado: data.estado,
      },
      include: asuntoIncludes,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.asuntoJuridico.update({
      where: { id },
      data: { estado: "CERRADO" },
    });
  }

  async findById(id: string): Promise<AsuntoJuridicoEntity | null> {
    return await this.prisma.asuntoJuridico.findUnique({
      where: { id },
      include: asuntoIncludes,
    });
  }

  async findByNombre(nombre: string): Promise<AsuntoJuridicoEntity | null> {
    return await this.prisma.asuntoJuridico.findFirst({
      where: {
        nombre,
        estado: { not: "CERRADO" },
      },
      include: asuntoIncludes,
    });
  }

  async getAll(): Promise<AsuntoJuridicoEntity[]> {
    return await this.prisma.asuntoJuridico.findMany({
      orderBy: { nombre: "asc" },
      include: asuntoIncludes,
    });
  }

  async getAllByCliente(
    clienteJuridicoId: string
  ): Promise<AsuntoJuridicoEntity[]> {
    return await this.prisma.asuntoJuridico.findMany({
      where: { clienteJuridicoId },
      orderBy: { nombre: "asc" },
      include: asuntoIncludes,
    });
  }
}
