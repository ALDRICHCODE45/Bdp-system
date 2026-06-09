import { PrismaClient, Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import type { MovimientoEntity } from "../../types/Movimiento.type";
import type {
  MovimientoRepository,
  MovimientoFilterParams,
  FindAllMovimientosResult,
  CreateMovimientoArgs,
  UpdateMovimientoArgs,
  MovimientoAggregates,
} from "./MovimientoRepository.repository";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 20;
const MAX_SIZE = 200;

const ALLOWED_SORT_COLUMNS = new Set([
  "fechaOperacion",
  "fechaCorte",
  "monto",
  "createdAt",
]);

/**
 * Eagerly-loaded relations for the Movimiento entity.
 * ClienteProveedor only needs nombre, Socio only needs nombre, User only needs name.
 */
const movimientoIncludes = {
  proveedorRef: { select: { id: true, nombre: true } },
  clienteRef: { select: { id: true, nombre: true } },
  solicitanteRef: { select: { id: true, nombre: true } },
  autorizadorRef: { select: { id: true, nombre: true } },
  ingresadoPorRef: { select: { id: true, name: true } },
} as const;

// ---------------------------------------------------------------------------
// Where clause builder
// ---------------------------------------------------------------------------

function buildMovimientoWhereClause(
  params: MovimientoFilterParams
): Prisma.MovimientoWhereInput {
  const conditions: Prisma.MovimientoWhereInput[] = [];

  // Tipo filter (tab)
  if (params.tipo && params.tipo !== "ALL") {
    conditions.push({ tipo: params.tipo });
  }

  // Global search
  if (params.search) {
    conditions.push({
      OR: [
        { descripcionLiteral: { contains: params.search, mode: "insensitive" } },
        { concepto: { contains: params.search, mode: "insensitive" } },
        { titular: { contains: params.search, mode: "insensitive" } },
        { proveedor: { contains: params.search, mode: "insensitive" } },
        { cliente: { contains: params.search, mode: "insensitive" } },
        { descripcionAdministracion: { contains: params.search, mode: "insensitive" } },
        { notas: { contains: params.search, mode: "insensitive" } },
      ],
    });
  }

  // Multi-select enum filters
  if (params.estado?.length) {
    conditions.push({ estado: { in: params.estado } });
  }
  if (params.categoria?.length) {
    conditions.push({ categoria: { in: params.categoria } });
  }
  if (params.formaPago?.length) {
    conditions.push({ formaPago: { in: params.formaPago } });
  }
  if (params.cargoAbono?.length) {
    conditions.push({ cargoAbono: { in: params.cargoAbono } });
  }
  if (params.facturadoPor?.length) {
    conditions.push({ facturadoPor: { in: params.facturadoPor } });
  }

  // FK / text filters
  if (params.titular?.length) {
    conditions.push({ titular: { in: params.titular } });
  }
  if (params.proveedorId?.length) {
    conditions.push({ proveedorId: { in: params.proveedorId } });
  }
  if (params.clienteId?.length) {
    conditions.push({ clienteId: { in: params.clienteId } });
  }
  if (params.solicitanteId?.length) {
    conditions.push({ solicitanteId: { in: params.solicitanteId } });
  }
  if (params.autorizadorId?.length) {
    conditions.push({ autorizadorId: { in: params.autorizadorId } });
  }

  // Date range: fechaOperacion
  if (params.fechaOperacionFrom || params.fechaOperacionTo) {
    conditions.push({
      fechaOperacion: {
        ...(params.fechaOperacionFrom && { gte: params.fechaOperacionFrom }),
        ...(params.fechaOperacionTo && { lte: params.fechaOperacionTo }),
      },
    });
  }

  // Date range: fechaCorte
  if (params.fechaCorteFrom || params.fechaCorteTo) {
    conditions.push({
      fechaCorte: {
        ...(params.fechaCorteFrom && { gte: params.fechaCorteFrom }),
        ...(params.fechaCorteTo && { lte: params.fechaCorteTo }),
      },
    });
  }

  // Monto range
  if (params.montoMin !== undefined || params.montoMax !== undefined) {
    conditions.push({
      monto: {
        ...(params.montoMin !== undefined && { gte: params.montoMin }),
        ...(params.montoMax !== undefined && { lte: params.montoMax }),
      },
    });
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class PrismaMovimientoRepository implements MovimientoRepository {
  constructor(private prisma: PrismaClient | PrismaTransactionClient) {}

  async findAll(params: MovimientoFilterParams): Promise<FindAllMovimientosResult> {
    const page = Math.max(params.page ?? DEFAULT_PAGE, 1);
    const size = Math.min(Math.max(params.size ?? DEFAULT_SIZE, 1), MAX_SIZE);
    const skip = (page - 1) * size;

    const sortColumn =
      params.sortBy && ALLOWED_SORT_COLUMNS.has(params.sortBy)
        ? params.sortBy
        : "fechaOperacion";
    const sortDir = params.sortDir ?? "desc";
    const orderBy = { [sortColumn]: sortDir };

    const where = buildMovimientoWhereClause(params);
    const aggregateWhere = buildMovimientoWhereClause({
      ...params,
      tipo: "ALL",
    });

    const [items, total, aggregates] = await Promise.all([
      this.prisma.movimiento.findMany({
        skip,
        take: size,
        orderBy,
        where,
        include: movimientoIncludes,
      }),
      this.prisma.movimiento.count({ where }),
      this.computeAggregates(aggregateWhere),
    ]);

    return { items: items as MovimientoEntity[], total, aggregates };
  }

  async findById(id: string): Promise<MovimientoEntity | null> {
    const result = await this.prisma.movimiento.findUnique({
      where: { id },
      include: movimientoIncludes,
    });
    return result as MovimientoEntity | null;
  }

  async findByDedupHash(dedupHash: string): Promise<MovimientoEntity | null> {
    const result = await this.prisma.movimiento.findUnique({
      where: { dedupHash },
      include: movimientoIncludes,
    });
    return result as MovimientoEntity | null;
  }

  async findDedupHashesIn(hashes: string[]): Promise<string[]> {
    if (hashes.length === 0) return [];
    const rows = await this.prisma.movimiento.findMany({
      where: { dedupHash: { in: hashes } },
      select: { dedupHash: true },
    });
    return rows.map((r) => r.dedupHash);
  }

  async getDistinctTitulares(): Promise<string[]> {
    const rows = await this.prisma.movimiento.findMany({
      select: { titular: true },
      distinct: ["titular"],
      orderBy: { titular: "asc" },
    });
    return rows.map((r) => r.titular);
  }

  async create(args: CreateMovimientoArgs): Promise<MovimientoEntity> {
    const result = await this.prisma.movimiento.create({
      data: {
        tipo: args.tipo,
        titular: args.titular,
        estadoCuenta: args.estadoCuenta,
        fechaCorte: args.fechaCorte,
        fechaOperacion: args.fechaOperacion,
        descripcionLiteral: args.descripcionLiteral,
        monto: new Decimal(args.monto),
        dedupHash: args.dedupHash,
        ingresadoPor: args.ingresadoPor,
        concepto: args.concepto ?? null,
        descripcionAdministracion: args.descripcionAdministracion ?? null,
        categoria: args.categoria ?? null,
        formaPago: args.formaPago ?? null,
        cargoAbono: args.cargoAbono ?? null,
        facturadoPor: args.facturadoPor ?? null,
        periodo: args.periodo ?? null,
        numeroFactura: args.numeroFactura ?? null,
        folioFiscal: args.folioFiscal ?? null,
        proveedor: args.proveedor ?? null,
        proveedorId: args.proveedorId ?? null,
        cliente: args.cliente ?? null,
        clienteId: args.clienteId ?? null,
        solicitanteId: args.solicitanteId ?? null,
        autorizadorId: args.autorizadorId ?? null,
        notas: args.notas ?? null,
        facturaId: args.facturaId ?? null,
        estado: args.estado ?? "PAGADO",
      },
      include: movimientoIncludes,
    });
    return result as MovimientoEntity;
  }

  async createMany(args: CreateMovimientoArgs[]): Promise<number> {
    const result = await this.prisma.movimiento.createMany({
      data: args.map((a) => ({
        tipo: a.tipo,
        titular: a.titular,
        estadoCuenta: a.estadoCuenta,
        fechaCorte: a.fechaCorte,
        fechaOperacion: a.fechaOperacion,
        descripcionLiteral: a.descripcionLiteral,
        monto: new Decimal(a.monto),
        dedupHash: a.dedupHash,
        ingresadoPor: a.ingresadoPor,
        concepto: a.concepto ?? null,
        descripcionAdministracion: a.descripcionAdministracion ?? null,
        categoria: a.categoria ?? null,
        formaPago: a.formaPago ?? null,
        cargoAbono: a.cargoAbono ?? null,
        facturadoPor: a.facturadoPor ?? null,
        periodo: a.periodo ?? null,
        numeroFactura: a.numeroFactura ?? null,
        folioFiscal: a.folioFiscal ?? null,
        proveedor: a.proveedor ?? null,
        proveedorId: a.proveedorId ?? null,
        cliente: a.cliente ?? null,
        clienteId: a.clienteId ?? null,
        solicitanteId: a.solicitanteId ?? null,
        autorizadorId: a.autorizadorId ?? null,
        notas: a.notas ?? null,
        facturaId: a.facturaId ?? null,
        estado: a.estado ?? "PAGADO",
      })),
      skipDuplicates: true,
    });
    return result.count;
  }

  async update(args: UpdateMovimientoArgs): Promise<MovimientoEntity> {
    const { id, ...data } = args;

    // Build update payload only with defined keys.
    // UncheckedUpdateInput allows direct FK assignment (proveedorId, clienteId, etc.)
    const updateData: Prisma.MovimientoUncheckedUpdateInput = {};
    if (data.tipo !== undefined) updateData.tipo = data.tipo;
    if (data.titular !== undefined) updateData.titular = data.titular;
    if (data.estadoCuenta !== undefined) updateData.estadoCuenta = data.estadoCuenta;
    if (data.fechaCorte !== undefined) updateData.fechaCorte = data.fechaCorte;
    if (data.fechaOperacion !== undefined) updateData.fechaOperacion = data.fechaOperacion;
    if (data.descripcionLiteral !== undefined) updateData.descripcionLiteral = data.descripcionLiteral;
    if (data.monto !== undefined) updateData.monto = new Decimal(data.monto);
    if (data.concepto !== undefined) updateData.concepto = data.concepto;
    if (data.descripcionAdministracion !== undefined) updateData.descripcionAdministracion = data.descripcionAdministracion;
    if (data.categoria !== undefined) updateData.categoria = data.categoria;
    if (data.formaPago !== undefined) updateData.formaPago = data.formaPago;
    if (data.cargoAbono !== undefined) updateData.cargoAbono = data.cargoAbono;
    if (data.facturadoPor !== undefined) updateData.facturadoPor = data.facturadoPor;
    if (data.periodo !== undefined) updateData.periodo = data.periodo;
    if (data.numeroFactura !== undefined) updateData.numeroFactura = data.numeroFactura;
    if (data.folioFiscal !== undefined) updateData.folioFiscal = data.folioFiscal;
    if (data.proveedor !== undefined) updateData.proveedor = data.proveedor;
    if (data.proveedorId !== undefined) updateData.proveedorId = data.proveedorId;
    if (data.cliente !== undefined) updateData.cliente = data.cliente;
    if (data.clienteId !== undefined) updateData.clienteId = data.clienteId;
    if (data.solicitanteId !== undefined) updateData.solicitanteId = data.solicitanteId;
    if (data.autorizadorId !== undefined) updateData.autorizadorId = data.autorizadorId;
    if (data.notas !== undefined) updateData.notas = data.notas;
    if (data.facturaId !== undefined) updateData.facturaId = data.facturaId;
    if (data.estado !== undefined) updateData.estado = data.estado;

    const result = await this.prisma.movimiento.update({
      where: { id },
      data: updateData,
      include: movimientoIncludes,
    });
    return result as MovimientoEntity;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.movimiento.delete({ where: { id } });
  }

  // ---------------------------------------------------------------------------
  // Private: aggregate computation
  // ---------------------------------------------------------------------------

  /**
   * Computes aggregate sums and counts for INGRESO and EGRESO separately.
   * Uses the same `where` clause as findAll to respect active filters.
   */
  private async computeAggregates(
    where: Prisma.MovimientoWhereInput
  ): Promise<MovimientoAggregates> {
    const [ingresos, egresos] = await Promise.all([
      this.prisma.movimiento.aggregate({
        where: { ...where, tipo: "INGRESO" },
        _sum: { monto: true },
        _count: { _all: true },
      }),
      this.prisma.movimiento.aggregate({
        where: { ...where, tipo: "EGRESO" },
        _sum: { monto: true },
        _count: { _all: true },
      }),
    ]);

    return {
      totalIngresos: ingresos._sum.monto ?? new Decimal(0),
      totalEgresos: egresos._sum.monto ?? new Decimal(0),
      countIngresos: ingresos._count._all,
      countEgresos: egresos._count._all,
    };
  }
}
