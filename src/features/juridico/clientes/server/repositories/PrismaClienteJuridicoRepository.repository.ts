import { Prisma, PrismaClient } from "@prisma/client";
import type {
  ClienteJuridicoRepository,
  ClienteJuridicoEntity,
  CreateClienteJuridicoArgs,
  UpdateClienteJuridicoArgs,
} from "./ClienteJuridicoRepository.repository";
import type { ClientesJuridicosFilterParams } from "../../types/ClientesJuridicosFilterParams";

export class PrismaClienteJuridicoRepository
  implements ClienteJuridicoRepository
{
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateClienteJuridicoArgs): Promise<ClienteJuridicoEntity> {
    return await this.prisma.clienteJuridico.create({
      data: {
        nombre: data.nombre,
        rfc: data.rfc ?? null,
        contacto: data.contacto ?? null,
        email: data.email ?? null,
        telefono: data.telefono ?? null,
        direccion: data.direccion ?? null,
        notas: data.notas ?? null,
      },
    });
  }

  async update(data: UpdateClienteJuridicoArgs): Promise<ClienteJuridicoEntity> {
    return await this.prisma.clienteJuridico.update({
      where: { id: data.id },
      data: {
        nombre: data.nombre,
        rfc: data.rfc ?? null,
        contacto: data.contacto ?? null,
        email: data.email ?? null,
        telefono: data.telefono ?? null,
        direccion: data.direccion ?? null,
        notas: data.notas ?? null,
      },
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.clienteJuridico.update({
      where: { id },
      data: { activo: false },
    });
  }

  async findById(id: string): Promise<ClienteJuridicoEntity | null> {
    return await this.prisma.clienteJuridico.findUnique({
      where: { id },
    });
  }

  async findByNombre(nombre: string): Promise<ClienteJuridicoEntity | null> {
    return await this.prisma.clienteJuridico.findFirst({
      where: {
        nombre,
        activo: true,
      },
    });
  }

  async getAll(): Promise<ClienteJuridicoEntity[]> {
    return await this.prisma.clienteJuridico.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    });
  }

  async getPaginated(
    params: ClientesJuridicosFilterParams
  ): Promise<{ data: ClienteJuridicoEntity[]; totalCount: number }> {
    const { page, pageSize, sortBy, sortOrder, search } = params;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ClienteJuridicoWhereInput = {
      activo: params.activo ?? true,
    };

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: "insensitive" } },
        { rfc: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { contacto: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy: Prisma.ClienteJuridicoOrderByWithRelationInput = {};
    if (sortBy) {
      (orderBy as Record<string, string>)[sortBy] = sortOrder ?? "asc";
    } else {
      orderBy.nombre = "asc";
    }

    const [data, totalCount] = await Promise.all([
      this.prisma.clienteJuridico.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
      }),
      this.prisma.clienteJuridico.count({ where }),
    ]);

    return { data, totalCount };
  }
}
