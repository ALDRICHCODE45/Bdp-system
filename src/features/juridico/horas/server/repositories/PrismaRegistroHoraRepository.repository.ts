import { Prisma, PrismaClient } from "@prisma/client";
import type {
  RegistroHoraRepository,
  RegistroHoraEntity,
  CreateRegistroHoraArgs,
  UpdateRegistroHoraArgs,
} from "./RegistroHoraRepository.repository";
import type { RegistroHorasFilterParams } from "../../types/RegistroHorasFilterParams";

const registroHoraIncludes = {
  usuario: { select: { id: true, name: true, email: true } },
  equipoJuridico: { select: { id: true, nombre: true } },
  clienteJuridico: { select: { id: true, nombre: true } },
  asuntoJuridico: { select: { id: true, nombre: true } },
  socio: { select: { id: true, nombre: true } },
} as const;

export class PrismaRegistroHoraRepository implements RegistroHoraRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateRegistroHoraArgs): Promise<RegistroHoraEntity> {
    return await this.prisma.registroHora.create({
      data: {
        usuarioId: data.usuarioId,
        equipoJuridicoId: data.equipoJuridicoId,
        clienteJuridicoId: data.clienteJuridicoId,
        asuntoJuridicoId: data.asuntoJuridicoId,
        socioId: data.socioId,
        horas: new Prisma.Decimal(data.horas),
        descripcion: data.descripcion ?? null,
        ano: data.ano,
        semana: data.semana,
        editable: true,
      },
      include: registroHoraIncludes,
    });
  }

  async update(data: UpdateRegistroHoraArgs): Promise<RegistroHoraEntity> {
    return await this.prisma.registroHora.update({
      where: { id: data.id },
      data: {
        equipoJuridicoId: data.equipoJuridicoId,
        clienteJuridicoId: data.clienteJuridicoId,
        asuntoJuridicoId: data.asuntoJuridicoId,
        socioId: data.socioId,
        horas: new Prisma.Decimal(data.horas),
        descripcion: data.descripcion ?? null,
      },
      include: registroHoraIncludes,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.registroHora.delete({ where: { id } });
  }

  async findById(id: string): Promise<RegistroHoraEntity | null> {
    return await this.prisma.registroHora.findUnique({
      where: { id },
      include: registroHoraIncludes,
    });
  }

  async findByUsuarioAndWeek(
    usuarioId: string,
    ano: number,
    semana: number
  ): Promise<RegistroHoraEntity[]> {
    return await this.prisma.registroHora.findMany({
      where: { usuarioId, ano, semana },
      include: registroHoraIncludes,
      orderBy: { createdAt: "desc" },
    });
  }

  async getAll(): Promise<RegistroHoraEntity[]> {
    return await this.prisma.registroHora.findMany({
      include: registroHoraIncludes,
      orderBy: [{ ano: "desc" }, { semana: "desc" }, { createdAt: "desc" }],
    });
  }

  async getAllByUsuario(usuarioId: string): Promise<RegistroHoraEntity[]> {
    return await this.prisma.registroHora.findMany({
      where: { usuarioId },
      include: registroHoraIncludes,
      orderBy: [{ ano: "desc" }, { semana: "desc" }, { createdAt: "desc" }],
    });
  }

  async setEditable(id: string, editable: boolean): Promise<void> {
    await this.prisma.registroHora.update({
      where: { id },
      data: { editable },
    });
  }

  async getPaginated(
    params: RegistroHorasFilterParams
  ): Promise<{ data: RegistroHoraEntity[]; totalCount: number }> {
    const {
      page = 1,
      pageSize = 10,
      sortBy,
      sortOrder,
      search,
      equipoJuridicoId,
      clienteJuridicoId,
      asuntoJuridicoId,
      socioId,
      usuarioId,
      ano,
      semanaDesde,
      semanaHasta,
    } = params;

    const skip = (page - 1) * pageSize;

    const where: Prisma.RegistroHoraWhereInput = {
      ...(equipoJuridicoId ? { equipoJuridicoId } : {}),
      ...(clienteJuridicoId ? { clienteJuridicoId } : {}),
      ...(asuntoJuridicoId ? { asuntoJuridicoId } : {}),
      ...(socioId ? { socioId } : {}),
      ...(usuarioId ? { usuarioId } : {}),
      ...(ano ? { ano } : {}),
      ...(semanaDesde || semanaHasta
        ? {
            semana: {
              ...(semanaDesde ? { gte: semanaDesde } : {}),
              ...(semanaHasta ? { lte: semanaHasta } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              {
                usuario: {
                  name: { contains: search, mode: "insensitive" },
                },
              },
              {
                equipoJuridico: {
                  nombre: { contains: search, mode: "insensitive" },
                },
              },
              {
                clienteJuridico: {
                  nombre: { contains: search, mode: "insensitive" },
                },
              },
              {
                asuntoJuridico: {
                  nombre: { contains: search, mode: "insensitive" },
                },
              },
              {
                socio: {
                  nombre: { contains: search, mode: "insensitive" },
                },
              },
              {
                descripcion: { contains: search, mode: "insensitive" },
              },
            ],
          }
        : {}),
    };

    // Build orderBy
    let orderBy: Prisma.RegistroHoraOrderByWithRelationInput[] = [
      { ano: "desc" },
      { semana: "desc" },
      { createdAt: "desc" },
    ];

    if (sortBy) {
      const direction = sortOrder ?? "asc";
      const columnMap: Record<
        string,
        Prisma.RegistroHoraOrderByWithRelationInput
      > = {
        semana: { semana: direction },
        ano: { ano: direction },
        horas: { horas: direction },
        editable: { editable: direction },
        createdAt: { createdAt: direction },
        equipoJuridicoNombre: { equipoJuridico: { nombre: direction } },
        clienteJuridicoNombre: { clienteJuridico: { nombre: direction } },
        asuntoJuridicoNombre: { asuntoJuridico: { nombre: direction } },
        socioNombre: { socio: { nombre: direction } },
        usuarioNombre: { usuario: { name: direction } },
      };
      if (columnMap[sortBy]) {
        orderBy = [columnMap[sortBy]];
      }
    }

    const [data, totalCount] = await Promise.all([
      this.prisma.registroHora.findMany({
        where,
        include: registroHoraIncludes,
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.registroHora.count({ where }),
    ]);

    return { data, totalCount };
  }
}
