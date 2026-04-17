import { Prisma, PrismaClient } from "@prisma/client";
import type {
  AsuntoJuridicoRepository,
  AsuntoJuridicoEntity,
  CreateAsuntoJuridicoArgs,
  UpdateAsuntoJuridicoArgs,
} from "./AsuntoJuridicoRepository.repository";
import type { AsuntosJuridicosFilterParams } from "../../types/AsuntosJuridicosFilterParams";

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

  async getPaginated(
    params: AsuntosJuridicosFilterParams
  ): Promise<{ data: AsuntoJuridicoEntity[]; totalCount: number }> {
    const { page, pageSize, sortBy, sortOrder, search, estado, clienteJuridicoId } =
      params;
    const skip = (page - 1) * pageSize;

    const where: Prisma.AsuntoJuridicoWhereInput = {};

    if (clienteJuridicoId) {
      where.clienteJuridicoId = clienteJuridicoId;
    }

    if (estado && estado.length > 0) {
      where.estado = { in: estado as ("ACTIVO" | "INACTIVO" | "CERRADO")[] };
    }

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { descripcion: { contains: search, mode: "insensitive" } },
        {
          clienteJuridico: {
            nombre: { contains: search, mode: "insensitive" },
          },
        },
        {
          socio: { nombre: { contains: search, mode: "insensitive" } },
        },
      ];
    }

    const orderBy: Prisma.AsuntoJuridicoOrderByWithRelationInput = {};
    if (sortBy && sortBy !== "clienteJuridicoNombre" && sortBy !== "socioNombre") {
      (orderBy as Record<string, string>)[sortBy] = sortOrder ?? "asc";
    } else if (sortBy === "clienteJuridicoNombre") {
      orderBy.clienteJuridico = { nombre: sortOrder ?? "asc" };
    } else if (sortBy === "socioNombre") {
      orderBy.socio = { nombre: sortOrder ?? "asc" };
    } else {
      orderBy.nombre = "asc";
    }

    const [data, totalCount] = await Promise.all([
      this.prisma.asuntoJuridico.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: asuntoIncludes,
      }),
      this.prisma.asuntoJuridico.count({ where }),
    ]);

    return { data, totalCount };
  }
}
