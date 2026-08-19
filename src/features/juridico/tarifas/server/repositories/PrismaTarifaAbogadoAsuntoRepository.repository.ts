import { Prisma, type PrismaClient } from "@prisma/client";
import type {
  TarifaAbogadoAsuntoRepository,
  TarifaAbogadoAsuntoEntity,
  CreateTarifaAbogadoAsuntoArgs,
  UpdateTarifaAbogadoAsuntoArgs,
  DeactivateTarifaAbogadoAsuntoArgs,
} from "./TarifaAbogadoAsuntoRepository.repository";

const tarifaIncludes = {
  usuario: { select: { id: true, name: true, email: true } },
  asuntoJuridico: { select: { id: true, nombre: true } },
  createdBy: { select: { id: true, name: true } },
  updatedBy: { select: { id: true, name: true } },
} as const;

export class PrismaTarifaAbogadoAsuntoRepository implements TarifaAbogadoAsuntoRepository {
  constructor(private prisma: PrismaClient) {}

  async create(
    data: CreateTarifaAbogadoAsuntoArgs,
  ): Promise<TarifaAbogadoAsuntoEntity> {
    return await this.prisma.tarifaAbogadoAsunto.create({
      data: {
        usuarioId: data.usuarioId,
        asuntoJuridicoId: data.asuntoJuridicoId,
        tarifaHora: new Prisma.Decimal(
          data.tarifaHora as number | Prisma.Decimal,
        ),
        createdById: data.createdById,
        updatedById: data.updatedById,
      },
      include: tarifaIncludes,
    });
  }

  async update(
    data: UpdateTarifaAbogadoAsuntoArgs,
  ): Promise<TarifaAbogadoAsuntoEntity> {
    return await this.prisma.tarifaAbogadoAsunto.update({
      where: { id: data.id },
      data: {
        tarifaHora: new Prisma.Decimal(
          data.tarifaHora as number | Prisma.Decimal,
        ),
        updatedById: data.updatedById,
      },
      include: tarifaIncludes,
    });
  }

  async deactivate(
    data: DeactivateTarifaAbogadoAsuntoArgs,
  ): Promise<TarifaAbogadoAsuntoEntity> {
    return await this.prisma.tarifaAbogadoAsunto.update({
      where: { id: data.id },
      data: {
        activa: false,
        updatedById: data.updatedById,
      },
      include: tarifaIncludes,
    });
  }

  async findById(id: string): Promise<TarifaAbogadoAsuntoEntity | null> {
    return await this.prisma.tarifaAbogadoAsunto.findUnique({
      where: { id },
      include: tarifaIncludes,
    });
  }

  async findActiveByUsuarioAndAsunto(
    usuarioId: string,
    asuntoJuridicoId: string,
  ): Promise<{ id: string; tarifaHora: Prisma.Decimal } | null> {
    const row = await this.prisma.tarifaAbogadoAsunto.findFirst({
      where: { usuarioId, asuntoJuridicoId, activa: true },
      select: { id: true, tarifaHora: true },
    });
    return row;
  }

  async findAllActive(): Promise<TarifaAbogadoAsuntoEntity[]> {
    return await this.prisma.tarifaAbogadoAsunto.findMany({
      where: { activa: true },
      orderBy: [
        { usuario: { name: "asc" } },
        { asuntoJuridico: { nombre: "asc" } },
      ],
      include: tarifaIncludes,
    });
  }

  async findActiveByUsuario(usuarioId: string): Promise<
    Array<{
      id: string;
      usuarioId: string;
      asuntoJuridicoId: string;
      tarifaHora: Prisma.Decimal;
    }>
  > {
    return await this.prisma.tarifaAbogadoAsunto.findMany({
      where: { usuarioId, activa: true },
      select: {
        id: true,
        usuarioId: true,
        asuntoJuridicoId: true,
        tarifaHora: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }
}
