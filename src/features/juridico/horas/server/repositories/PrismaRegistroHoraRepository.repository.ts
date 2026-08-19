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
  clienteProveedor: { select: { id: true, nombre: true } },
  asuntoJuridico: { select: { id: true, nombre: true } },
  socio: { select: { id: true, nombre: true } },
  autorizaciones: {
    where: { estado: "AUTORIZADA" as const },
    select: { id: true, estado: true },
    orderBy: { createdAt: "asc" as const },
    take: 1,
  },
} as const;

export class PrismaRegistroHoraRepository implements RegistroHoraRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateRegistroHoraArgs): Promise<RegistroHoraEntity> {
    return await this.prisma.registroHora.create({
      data: {
        usuarioId: data.usuarioId,
        equipoJuridicoId: data.equipoJuridicoId,
        clienteProveedorId: data.clienteProveedorId,
        asuntoJuridicoId: data.asuntoJuridicoId,
        socioId: data.socioId,
        horas: new Prisma.Decimal(data.horas),
        // REQ-RH-202: tarifaHora snapshot from active tariff at insert time.
        // Immutable post-insert — never written by update().
        tarifaHora: new Prisma.Decimal(
          data.tarifaHora as number | Prisma.Decimal,
        ),
        // REQ-RH-203: importe = horas × tarifaHora, persisted.
        importe: new Prisma.Decimal(data.importe as number | Prisma.Decimal),
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
        clienteProveedorId: data.clienteProveedorId,
        asuntoJuridicoId: data.asuntoJuridicoId,
        socioId: data.socioId,
        horas: new Prisma.Decimal(data.horas),
        // REQ-RH-203: update recomputes importe from FROZEN existing
        // tarifaHora. `tarifaHora` is NEVER written here.
        // If `importe` is null/undefined the caller opted out — we
        // intentionally leave the column untouched at the repo level
        // (the service always recomputes it from `existing.tarifaHora`).
        ...(data.importe !== undefined && data.importe !== null
          ? {
              importe: new Prisma.Decimal(
                data.importe as number | Prisma.Decimal,
              ),
            }
          : {}),
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
    semana: number,
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
    params: RegistroHorasFilterParams,
  ): Promise<{ data: RegistroHoraEntity[]; totalCount: number }> {
    const {
      page = 1,
      pageSize = 10,
      sortBy,
      sortOrder,
      search,
      equipoJuridicoId,
      clienteProveedorId,
      asuntoJuridicoId,
      socioId,
      usuarioId,
      equipoJuridicoIds,
      clienteProveedorIds,
      asuntoJuridicoIds,
      socioIds,
      usuarioIds,
      ano,
      semanaDesde,
      semanaHasta,
      horasMin,
      horasMax,
      fechaRegistroDesde,
      fechaRegistroHasta,
    } = params;

    const skip = (page - 1) * pageSize;

    const where: Prisma.RegistroHoraWhereInput = {
      ...(equipoJuridicoIds && equipoJuridicoIds.length > 0
        ? { equipoJuridicoId: { in: equipoJuridicoIds } }
        : equipoJuridicoId
          ? { equipoJuridicoId }
          : {}),
      ...(clienteProveedorIds && clienteProveedorIds.length > 0
        ? { clienteProveedorId: { in: clienteProveedorIds } }
        : clienteProveedorId
          ? { clienteProveedorId }
          : {}),
      ...(asuntoJuridicoIds && asuntoJuridicoIds.length > 0
        ? { asuntoJuridicoId: { in: asuntoJuridicoIds } }
        : asuntoJuridicoId
          ? { asuntoJuridicoId }
          : {}),
      ...(socioIds && socioIds.length > 0
        ? { socioId: { in: socioIds } }
        : socioId
          ? { socioId }
          : {}),
      ...(usuarioIds && usuarioIds.length > 0
        ? { usuarioId: { in: usuarioIds } }
        : usuarioId
          ? { usuarioId }
          : {}),
      ...(ano ? { ano } : {}),
      ...(semanaDesde || semanaHasta
        ? {
            semana: {
              ...(semanaDesde ? { gte: semanaDesde } : {}),
              ...(semanaHasta ? { lte: semanaHasta } : {}),
            },
          }
        : {}),
      ...(horasMin !== undefined || horasMax !== undefined
        ? {
            horas: {
              ...(horasMin !== undefined ? { gte: horasMin } : {}),
              ...(horasMax !== undefined ? { lte: horasMax } : {}),
            },
          }
        : {}),
      ...(fechaRegistroDesde || fechaRegistroHasta
        ? {
            createdAt: {
              ...(fechaRegistroDesde
                ? { gte: new Date(`${fechaRegistroDesde}T00:00:00.000Z`) }
                : {}),
              ...(fechaRegistroHasta
                ? { lte: new Date(`${fechaRegistroHasta}T23:59:59.999Z`) }
                : {}),
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
                clienteProveedor: {
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
        clienteProveedorNombre: { clienteProveedor: { nombre: direction } },
        asuntoJuridicoNombre: { asuntoJuridico: { nombre: direction } },
        socioNombre: { socio: { nombre: direction } },
        usuarioNombre: { usuario: { name: direction } },
      };
      if (columnMap[sortBy]) {
        if (sortBy === "semana") {
          orderBy = [{ ano: direction }, { semana: direction }];
        } else {
          orderBy = [columnMap[sortBy]];
        }
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
