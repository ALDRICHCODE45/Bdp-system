import { PrismaClient, Prisma, ColaboradorEstado } from "@prisma/client";
import {
  ColaboradorRepository,
  ColaboradorWithSocio,
  CreateColaboradorArgs,
  UpdateColaboradorArgs,
} from "./ColaboradorRepository.repository";
import type { ColaboradoresFilterParams } from "../../types/ColaboradoresFilterParams";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

// Columns allowed for ORDER BY — keep tight to avoid Prisma type explosions.
const ALLOWED_SORT_COLUMNS = new Set([
  "name",
  "correo",
  "puesto",
  "status",
  "departamento",
  "nivel",
  "modalidad",
  "fechaIngreso",
  "createdAt",
  "updatedAt",
]);

// Statuses accepted from client (Prisma enum already validated, but belt-and-suspenders)
const VALID_STATUSES = new Set<string>([
  "CONTRATADO",
  "DESPEDIDO",
  "EN_LICENCIA",
]);

/**
 * Build the WHERE clause for colaborador queries.
 *
 * - search: case-insensitive contains over name + correo + puesto
 * - status: IN-list over validated enum values
 */
export function buildColaboradoresWhereClause(
  params: Omit<ColaboradoresFilterParams, "page" | "pageSize" | "sortBy" | "sortOrder">
): Prisma.ColaboradorWhereInput {
  const andConditions: Prisma.ColaboradorWhereInput[] = [];

  if (params.search && params.search.trim().length > 0) {
    const q = params.search.trim();
    andConditions.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { correo: { contains: q, mode: "insensitive" } },
        { puesto: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (params.status && params.status.length > 0) {
    const validStatuses = params.status
      .map((s) => s.toUpperCase())
      .filter((s): s is ColaboradorEstado => VALID_STATUSES.has(s));
    if (validStatuses.length > 0) {
      andConditions.push({ status: { in: validStatuses } });
    }
  }

  return andConditions.length > 0 ? { AND: andConditions } : {};
}

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
        // Perfil extendido (rh-colaboradores-completo · P0)
        ...(data.departamento !== undefined && {
          departamento: data.departamento,
        }),
        ...(data.nivel !== undefined && { nivel: data.nivel }),
        ...(data.modalidad !== undefined && { modalidad: data.modalidad }),
        ...(data.tipoContrato !== undefined && {
          tipoContrato: data.tipoContrato,
        }),
        ...(data.lugarTrabajo !== undefined && {
          lugarTrabajo: data.lugarTrabajo,
        }),
        ...(data.horario !== undefined && { horario: data.horario }),
        ...(data.fechaSalida !== undefined && {
          fechaSalida: data.fechaSalida,
        }),
        ...(data.nombrePreferido !== undefined && {
          nombrePreferido: data.nombrePreferido,
        }),
        ...(data.documentoIdentidad !== undefined && {
          documentoIdentidad: data.documentoIdentidad,
        }),
        ...(data.emailPersonal !== undefined && {
          emailPersonal: data.emailPersonal,
        }),
        ...(data.bio !== undefined && { bio: data.bio }),
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
        // Datos personales
        ...(data.fechaIngreso !== undefined && {
          fechaIngreso: data.fechaIngreso,
        }),
        ...(data.genero !== undefined && { genero: data.genero }),
        ...(data.fechaNacimiento !== undefined && {
          fechaNacimiento: data.fechaNacimiento,
        }),
        ...(data.nacionalidad !== undefined && {
          nacionalidad: data.nacionalidad,
        }),
        ...(data.estadoCivil !== undefined && {
          estadoCivil: data.estadoCivil,
        }),
        ...(data.tipoSangre !== undefined && { tipoSangre: data.tipoSangre }),
        // Contacto y dirección
        ...(data.direccion !== undefined && { direccion: data.direccion }),
        ...(data.telefono !== undefined && { telefono: data.telefono }),
        // Datos fiscales
        ...(data.rfc !== undefined && { rfc: data.rfc }),
        ...(data.curp !== undefined && { curp: data.curp }),
        // Académicos y laborales previos
        ...(data.ultimoGradoEstudios !== undefined && {
          ultimoGradoEstudios: data.ultimoGradoEstudios,
        }),
        ...(data.escuela !== undefined && { escuela: data.escuela }),
        ...(data.ultimoTrabajo !== undefined && {
          ultimoTrabajo: data.ultimoTrabajo,
        }),
        // Referencias personales
        ...(data.nombreReferenciaPersonal !== undefined && {
          nombreReferenciaPersonal: data.nombreReferenciaPersonal,
        }),
        ...(data.telefonoReferenciaPersonal !== undefined && {
          telefonoReferenciaPersonal: data.telefonoReferenciaPersonal,
        }),
        ...(data.parentescoReferenciaPersonal !== undefined && {
          parentescoReferenciaPersonal: data.parentescoReferenciaPersonal,
        }),
        // Referencias laborales
        ...(data.nombreReferenciaLaboral !== undefined && {
          nombreReferenciaLaboral: data.nombreReferenciaLaboral,
        }),
        ...(data.telefonoReferenciaLaboral !== undefined && {
          telefonoReferenciaLaboral: data.telefonoReferenciaLaboral,
        }),
        // Perfil extendido (rh-colaboradores-completo · P0)
        ...(data.departamento !== undefined && {
          departamento: data.departamento,
        }),
        ...(data.nivel !== undefined && { nivel: data.nivel }),
        ...(data.modalidad !== undefined && { modalidad: data.modalidad }),
        ...(data.tipoContrato !== undefined && {
          tipoContrato: data.tipoContrato,
        }),
        ...(data.lugarTrabajo !== undefined && {
          lugarTrabajo: data.lugarTrabajo,
        }),
        ...(data.horario !== undefined && { horario: data.horario }),
        ...(data.fechaSalida !== undefined && {
          fechaSalida: data.fechaSalida,
        }),
        ...(data.nombrePreferido !== undefined && {
          nombrePreferido: data.nombrePreferido,
        }),
        ...(data.documentoIdentidad !== undefined && {
          documentoIdentidad: data.documentoIdentidad,
        }),
        ...(data.emailPersonal !== undefined && {
          emailPersonal: data.emailPersonal,
        }),
        ...(data.bio !== undefined && { bio: data.bio }),
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

  async getPaginated(
    params: ColaboradoresFilterParams,
  ): Promise<{ data: ColaboradorWithSocio[]; totalCount: number }> {
    const skip = (params.page - 1) * params.pageSize;

    const sortColumn =
      params.sortBy && ALLOWED_SORT_COLUMNS.has(params.sortBy)
        ? params.sortBy
        : undefined;
    const orderBy = sortColumn
      ? { [sortColumn]: params.sortOrder ?? "desc" }
      : { createdAt: "desc" as const };

    const where = buildColaboradoresWhereClause(params);

    const [data, totalCount] = await Promise.all([
      this.prisma.colaborador.findMany({
        skip,
        take: params.pageSize,
        orderBy,
        where,
        include: {
          socio: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.colaborador.count({ where }),
    ]);

    return { data, totalCount };
  }

  async countByStatus(): Promise<{
    CONTRATADO: number;
    DESPEDIDO: number;
    EN_LICENCIA: number;
  }> {
    const rows = await this.prisma.colaborador.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    const counts = {
      CONTRATADO: 0,
      DESPEDIDO: 0,
      EN_LICENCIA: 0,
    };

    for (const row of rows) {
      const key = row.status as keyof typeof counts;
      if (key in counts) {
        counts[key] = row._count._all;
      }
    }
    return counts;
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
