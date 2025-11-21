import { PrismaClient } from "@prisma/client";
import {
  ColaboradorRepository,
  ColaboradorWithSocio,
  CreateColaboradorArgs,
  UpdateColaboradorArgs,
} from "./ColaboradorRepository.repository";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export class PrismaColaboradorRepository implements ColaboradorRepository {
  constructor(private prisma: PrismaClient | PrismaTransactionClient) {}

  async create(data: CreateColaboradorArgs): Promise<ColaboradorWithSocio> {
    return await this.prisma.colaborador.create({
      data: {
        name: data.name,
        correo: data.correo,
        puesto: data.puesto,
        status: data.status,
        imss: data.imss,
        socioId: data.socioId,
        banco: data.banco,
        clabe: data.clabe,
        sueldo: data.sueldo,
        activos: data.activos,
      },
      include: {
        socio: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });
  }

  async update(data: UpdateColaboradorArgs): Promise<ColaboradorWithSocio> {
    return await this.prisma.colaborador.update({
      where: { id: data.id },
      data: {
        name: data.name,
        correo: data.correo,
        puesto: data.puesto,
        status: data.status,
        imss: data.imss,
        socioId: data.socioId,
        banco: data.banco,
        clabe: data.clabe,
        sueldo: data.sueldo,
        activos: data.activos,
      },
      include: {
        socio: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });
  }

  async delete(data: { id: string }): Promise<void> {
    await this.prisma.colaborador.delete({
      where: { id: data.id },
    });
  }

  async findById(data: { id: string }): Promise<ColaboradorWithSocio | null> {
    return await this.prisma.colaborador.findUnique({
      where: { id: data.id },
      include: {
        socio: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });
  }

  async findByCorreo(data: {
    correo: string;
  }): Promise<ColaboradorWithSocio | null> {
    return await this.prisma.colaborador.findFirst({
      where: { correo: data.correo },
      include: {
        socio: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });
  }

  async getAll(): Promise<ColaboradorWithSocio[]> {
    return await this.prisma.colaborador.findMany({
      include: {
        socio: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findBySocioId(data: {
    socioId: string;
  }): Promise<ColaboradorWithSocio[]> {
    return await this.prisma.colaborador.findMany({
      where: { socioId: data.socioId },
      include: {
        socio: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
