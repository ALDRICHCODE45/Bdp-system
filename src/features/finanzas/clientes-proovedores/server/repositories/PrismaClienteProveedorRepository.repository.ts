import { PrismaClient, Prisma } from "@prisma/client";
import { startOfDay, endOfDay, parseISO } from "date-fns";
import {
  ClienteProveedorRepository,
  ClienteProveedorEntity,
  CreateClienteProveedorArgs,
  UpdateClienteProveedorArgs,
} from "./ClienteProveedorRepository.repository";
import type { ClientesProveedoresFilterParams } from "../../types/ClientesProveedoresFilterParams";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

const clienteProveedorIncludes = {
  socio: { select: { id: true, nombre: true } },
  ingresadoPorRef: { select: { name: true } },
} as const;

// Keep ORDER BY tight: only real ClienteProveedor columns are accepted, so an
// arbitrary client-supplied sortBy can never reach Prisma as an order key.
const ALLOWED_SORT_COLUMNS = new Set([
  "tipo",
  "nombre",
  "rfc",
  "email",
  "telefono",
  "contacto",
  "numeroCuenta",
  "clabe",
  "banco",
  "activo",
  "fechaRegistro",
  "createdAt",
  "updatedAt",
]);

/**
 * Build the Prisma WHERE clause for Clientes/Proveedores from filter params.
 *
 * - search: case-insensitive contains over nombre, rfc, email, contacto, banco
 * - tipo / activo / banco: scalar equality (tipo is validated against the enum)
 * - socioResponsable: case-insensitive contains over the related socio name
 * - fechaRegistro from/to: inclusive full-day range (start of "from", end of "to")
 */
function buildClienteProveedorWhereClause(
  params: ClientesProveedoresFilterParams,
): Prisma.ClienteProveedorWhereInput {
  const andConditions: Prisma.ClienteProveedorWhereInput[] = [];

  if (params.search) {
    andConditions.push({
      OR: [
        { nombre: { contains: params.search, mode: "insensitive" } },
        { rfc: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
        { contacto: { contains: params.search, mode: "insensitive" } },
        { banco: { contains: params.search, mode: "insensitive" } },
      ],
    });
  }

  if (params.tipo === "CLIENTE" || params.tipo === "PROVEEDOR") {
    andConditions.push({ tipo: params.tipo });
  }

  if (params.activo !== undefined) {
    andConditions.push({ activo: params.activo });
  }

  if (params.banco) {
    andConditions.push({ banco: params.banco });
  }

  if (params.socioResponsable) {
    andConditions.push({
      socio: {
        nombre: { contains: params.socioResponsable, mode: "insensitive" },
      },
    });
  }

  if (params.fechaRegistroFrom || params.fechaRegistroTo) {
    andConditions.push({
      fechaRegistro: {
        ...(params.fechaRegistroFrom && {
          gte: startOfDay(parseISO(params.fechaRegistroFrom)),
        }),
        ...(params.fechaRegistroTo && {
          lte: endOfDay(parseISO(params.fechaRegistroTo)),
        }),
      },
    });
  }

  return andConditions.length > 0 ? { AND: andConditions } : {};
}

export class PrismaClienteProveedorRepository
  implements ClienteProveedorRepository
{
  constructor(
    private prisma: PrismaClient | PrismaTransactionClient
  ) {}

  async create(
    data: CreateClienteProveedorArgs
  ): Promise<ClienteProveedorEntity> {
    return await this.prisma.clienteProveedor.create({
      data: {
        nombre: data.nombre,
        rfc: data.rfc,
        tipo: data.tipo,
        direccion: data.direccion,
        telefono: data.telefono,
        email: data.email,
        contacto: data.contacto,
        numeroCuenta: data.numeroCuenta,
        clabe: data.clabe,
        banco: data.banco,
        activo: data.activo,
        fechaRegistro: data.fechaRegistro,
        notas: data.notas,
        socioId: data.socioId,
        ingresadoPor: data.ingresadoPor,
      },
      include: clienteProveedorIncludes,
    });
  }

  async update(
    data: UpdateClienteProveedorArgs
  ): Promise<ClienteProveedorEntity> {
    return await this.prisma.clienteProveedor.update({
      where: { id: data.id },
      data: {
        nombre: data.nombre,
        rfc: data.rfc,
        tipo: data.tipo,
        direccion: data.direccion,
        telefono: data.telefono,
        email: data.email,
        contacto: data.contacto,
        numeroCuenta: data.numeroCuenta,
        clabe: data.clabe,
        banco: data.banco,
        activo: data.activo,
        fechaRegistro: data.fechaRegistro,
        notas: data.notas,
        socioId: data.socioId,
      },
      include: clienteProveedorIncludes,
    });
  }

  async delete(data: { id: string }): Promise<void> {
    await this.prisma.clienteProveedor.delete({
      where: { id: data.id },
    });
  }

  async findById(data: { id: string }): Promise<ClienteProveedorEntity | null> {
    return await this.prisma.clienteProveedor.findUnique({
      where: { id: data.id },
      include: clienteProveedorIncludes,
    });
  }

  async findByRfcAndTipo(data: {
    rfc: string;
    tipo: string;
  }): Promise<boolean> {
    const clienteProveedor = await this.prisma.clienteProveedor.findUnique({
      where: {
        rfc_tipo: {
          rfc: data.rfc,
          tipo: data.tipo as "CLIENTE" | "PROVEEDOR",
        },
      },
    });
    return !!clienteProveedor;
  }

  async getPaginated(
    params: ClientesProveedoresFilterParams,
  ): Promise<{ data: ClienteProveedorEntity[]; totalCount: number }> {
    const skip = (params.page - 1) * params.pageSize;

    const sortColumn =
      params.sortBy && ALLOWED_SORT_COLUMNS.has(params.sortBy)
        ? params.sortBy
        : undefined;
    const orderBy = sortColumn
      ? { [sortColumn]: params.sortOrder || "desc" }
      : { createdAt: "desc" as const };

    const where = buildClienteProveedorWhereClause(params);

    const [data, totalCount] = await Promise.all([
      this.prisma.clienteProveedor.findMany({
        skip,
        take: params.pageSize,
        orderBy,
        where,
        include: {
          socio: true,
          ingresadoPorRef: true,
        },
      }),
      this.prisma.clienteProveedor.count({ where }),
    ]);

    return { data, totalCount };
  }

  async getAll(): Promise<ClienteProveedorEntity[]> {
    return await this.prisma.clienteProveedor.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: clienteProveedorIncludes,
    });
  }
}
