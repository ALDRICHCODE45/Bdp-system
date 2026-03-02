import { PrismaClient, Prisma, FacturaEstado } from "@prisma/client";
import {
  FacturaRepository,
  FacturaEntity,
  FacturaAggregateRow,
  CreateFacturaArgs,
  UpdateFacturaArgs,
} from "./FacturaRepository.repository";
import { Decimal } from "@prisma/client/runtime/library";
import { FacturasFilterParams } from "../../types/FacturasFilterParams";
import { parseISO } from "date-fns";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

const facturaIncludes = {
  ingresadoPorRef: { select: { name: true } },
} as const;

const VALID_ESTADOS = new Set<string>(["BORRADOR", "ENVIADA", "PAGADA", "CANCELADA"]);

const ALLOWED_SORT_COLUMNS = new Set([
  "concepto", "subtotal", "total", "uuid", "rfcEmisor", "rfcReceptor",
  "moneda", "status", "createdAt", "updatedAt", "fechaPago", "metodoPago",
  "serie", "folio", "nombreEmisor", "nombreReceptor", "statusPago",
]);

/** Convierte un string a número, devuelve undefined si está vacío o es NaN */
const toNum = (v: string | number | undefined): number | undefined => {
  if (v === undefined || v === "") return undefined;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return isNaN(n) ? undefined : n;
};

/**
 * Construye el WHERE clause de Prisma para facturas a partir de los FilterParams.
 * Extraído como helper para reutilizarlo en getPaginated y getAggregates
 * sin duplicar la lógica de filtrado.
 */
export function buildFacturasWhereClause(
  params: Omit<FacturasFilterParams, "page" | "pageSize" | "sortBy" | "sortOrder">
): Prisma.FacturaWhereInput {
  const andConditions: Prisma.FacturaWhereInput[] = [];

  // ── Búsqueda global ──────────────────────────────────────────────────────
  if (params.search) {
    andConditions.push({
      OR: [
        { concepto:      { contains: params.search, mode: "insensitive" } },
        { uuid:          { contains: params.search, mode: "insensitive" } },
        { rfcEmisor:     { contains: params.search, mode: "insensitive" } },
        { rfcReceptor:   { contains: params.search, mode: "insensitive" } },
        { nombreEmisor:  { contains: params.search, mode: "insensitive" } },
        { nombreReceptor:{ contains: params.search, mode: "insensitive" } },
      ],
    });
  }

  // ── Tab: status (multi-select → IN) ─────────────────────────────────────
  if (params.status?.length) {
    const validStatuses = params.status
      .map((s) => s.toUpperCase())
      .filter((s) => VALID_ESTADOS.has(s)) as FacturaEstado[];
    if (validStatuses.length > 0) {
      andConditions.push({ status: { in: validStatuses } });
    }
  }

  // ── Quick filters (multi-select → IN) ────────────────────────────────────
  if (params.metodoPago?.length) {
    andConditions.push({ metodoPago: { in: params.metodoPago } });
  }
  if (params.moneda?.length) {
    andConditions.push({ moneda: { in: params.moneda } });
  }
  if (params.statusPago?.length) {
    andConditions.push({ statusPago: { in: params.statusPago } });
  }

  // ── Identificación ───────────────────────────────────────────────────────
  if (params.uuid?.length) {
    andConditions.push({
      OR: params.uuid.map((u) => ({
        uuid: { contains: u, mode: "insensitive" as const },
      })),
    });
  }
  if (params.usoCfdi?.length) {
    andConditions.push({ usoCfdi: { in: params.usoCfdi } });
  }

  // ── Emisor ───────────────────────────────────────────────────────────────
  if (params.rfcEmisor?.length) {
    andConditions.push({
      OR: params.rfcEmisor.map((v) => ({
        rfcEmisor: { contains: v, mode: "insensitive" as const },
      })),
    });
  }
  if (params.nombreEmisor?.length) {
    andConditions.push({
      OR: params.nombreEmisor.map((v) => ({
        nombreEmisor: { contains: v, mode: "insensitive" as const },
      })),
    });
  }

  // ── Receptor ─────────────────────────────────────────────────────────────
  if (params.rfcReceptor?.length) {
    andConditions.push({
      OR: params.rfcReceptor.map((v) => ({
        rfcReceptor: { contains: v, mode: "insensitive" as const },
      })),
    });
  }
  if (params.nombreReceptor?.length) {
    andConditions.push({
      OR: params.nombreReceptor.map((v) => ({
        nombreReceptor: { contains: v, mode: "insensitive" as const },
      })),
    });
  }

  // ── Montos ───────────────────────────────────────────────────────────────
  const subtotalMin = toNum(params.subtotalMin);
  const subtotalMax = toNum(params.subtotalMax);
  if (subtotalMin !== undefined || subtotalMax !== undefined) {
    andConditions.push({
      subtotal: {
        ...(subtotalMin !== undefined && { gte: subtotalMin }),
        ...(subtotalMax !== undefined && { lte: subtotalMax }),
      },
    });
  }

  const totalMin = toNum(params.totalMin);
  const totalMax = toNum(params.totalMax);
  if (totalMin !== undefined || totalMax !== undefined) {
    andConditions.push({
      total: {
        ...(totalMin !== undefined && { gte: totalMin }),
        ...(totalMax !== undefined && { lte: totalMax }),
      },
    });
  }

  const impTrasMin = toNum(params.impTrasladosMin);
  const impTrasMax = toNum(params.impTrasladosMax);
  if (impTrasMin !== undefined || impTrasMax !== undefined) {
    andConditions.push({
      totalImpuestosTransladados: {
        ...(impTrasMin !== undefined && { gte: impTrasMin }),
        ...(impTrasMax !== undefined && { lte: impTrasMax }),
      },
    });
  }

  const impRetMin = toNum(params.impRetenidosMin);
  const impRetMax = toNum(params.impRetenidosMax);
  if (impRetMin !== undefined || impRetMax !== undefined) {
    andConditions.push({
      totalImpuestosRetenidos: {
        ...(impRetMin !== undefined && { gte: impRetMin }),
        ...(impRetMax !== undefined && { lte: impRetMax }),
      },
    });
  }

  // ── Fecha de pago ────────────────────────────────────────────────────────
  if (params.fechaPagoFrom || params.fechaPagoTo) {
    andConditions.push({
      fechaPago: {
        ...(params.fechaPagoFrom && { gte: parseISO(params.fechaPagoFrom) }),
        ...(params.fechaPagoTo && {
          lte: new Date(params.fechaPagoTo + "T23:59:59"),
        }),
      },
    });
  }

  // ── Auditoría ────────────────────────────────────────────────────────────
  if (params.ingresadoPor?.length) {
    andConditions.push({ ingresadoPor: { in: params.ingresadoPor } });
  }
  if (params.createdAtFrom || params.createdAtTo) {
    andConditions.push({
      createdAt: {
        ...(params.createdAtFrom && { gte: parseISO(params.createdAtFrom) }),
        ...(params.createdAtTo && {
          lte: new Date(params.createdAtTo + "T23:59:59"),
        }),
      },
    });
  }
  if (params.updatedAtFrom || params.updatedAtTo) {
    andConditions.push({
      updatedAt: {
        ...(params.updatedAtFrom && { gte: parseISO(params.updatedAtFrom) }),
        ...(params.updatedAtTo && {
          lte: new Date(params.updatedAtTo + "T23:59:59"),
        }),
      },
    });
  }

  return andConditions.length > 0 ? { AND: andConditions } : {};
}

export class PrismaFacturaRepository implements FacturaRepository {
  constructor(private prisma: PrismaClient | PrismaTransactionClient) {}

  async create(data: CreateFacturaArgs): Promise<FacturaEntity> {
    const factura = await this.prisma.factura.create({
      data: {
        concepto: data.concepto,
        serie: data.serie ?? null,
        folio: data.folio ?? null,
        subtotal: new Decimal(data.subtotal),
        totalImpuestosTransladados: data.totalImpuestosTransladados != null ? new Decimal(data.totalImpuestosTransladados) : null,
        totalImpuestosRetenidos: data.totalImpuestosRetenidos != null ? new Decimal(data.totalImpuestosRetenidos) : null,
        total: new Decimal(data.total),
        uuid: data.uuid,
        rfcEmisor: data.rfcEmisor,
        nombreReceptor: data.nombreReceptor ?? null,
        rfcReceptor: data.rfcReceptor,
        metodoPago: data.metodoPago ?? null,
        moneda: data.moneda ?? "MXN",
        usoCfdi: data.usoCfdi ?? null,
        status: data.status,
        nombreEmisor: data.nombreEmisor ?? null,
        statusPago: data.statusPago ?? null,
        fechaPago: data.fechaPago,
        ingresadoPor: data.ingresadoPor,
      },
      include: facturaIncludes,
    });
    return factura;
  }

  async update(data: UpdateFacturaArgs): Promise<FacturaEntity> {
    const factura = await this.prisma.factura.update({
      where: { id: data.id },
      data: {
        concepto: data.concepto,
        serie: data.serie ?? null,
        folio: data.folio ?? null,
        subtotal: new Decimal(data.subtotal),
        totalImpuestosTransladados: data.totalImpuestosTransladados != null ? new Decimal(data.totalImpuestosTransladados) : null,
        totalImpuestosRetenidos: data.totalImpuestosRetenidos != null ? new Decimal(data.totalImpuestosRetenidos) : null,
        total: new Decimal(data.total),
        uuid: data.uuid,
        rfcEmisor: data.rfcEmisor,
        nombreReceptor: data.nombreReceptor ?? null,
        rfcReceptor: data.rfcReceptor,
        metodoPago: data.metodoPago ?? null,
        moneda: data.moneda ?? "MXN",
        usoCfdi: data.usoCfdi ?? null,
        status: data.status,
        nombreEmisor: data.nombreEmisor ?? null,
        statusPago: data.statusPago ?? null,
        fechaPago: data.fechaPago,
      },
      include: facturaIncludes,
    });
    return factura;
  }

  async delete(data: { id: string }): Promise<void> {
    await this.prisma.factura.delete({ where: { id: data.id } });
  }

  async findById(data: { id: string }): Promise<FacturaEntity | null> {
    return this.prisma.factura.findUnique({
      where: { id: data.id },
      include: facturaIncludes,
    });
  }

  async findByUuid(uuid: string): Promise<boolean> {
    const factura = await this.prisma.factura.findUnique({ where: { uuid } });
    return factura !== null;
  }

  async getAll(): Promise<FacturaEntity[]> {
    return this.prisma.factura.findMany({
      include: facturaIncludes,
      orderBy: { createdAt: "desc" },
    });
  }

  async getPaginated(
    params: FacturasFilterParams
  ): Promise<{ data: FacturaEntity[]; totalCount: number }> {
    const skip = (params.page - 1) * params.pageSize;

    const sortColumn =
      params.sortBy && ALLOWED_SORT_COLUMNS.has(params.sortBy)
        ? params.sortBy
        : undefined;
    const orderBy = sortColumn
      ? { [sortColumn]: params.sortOrder ?? "desc" }
      : { createdAt: "desc" as const };

    const where = buildFacturasWhereClause(params);

    const [data, totalCount] = await Promise.all([
      this.prisma.factura.findMany({
        skip,
        take: params.pageSize,
        orderBy,
        where,
        include: facturaIncludes,
      }),
      this.prisma.factura.count({ where }),
    ]);

    return { data, totalCount };
  }

  async getAggregates(
    params: Omit<FacturasFilterParams, "page" | "pageSize" | "sortBy" | "sortOrder">
  ): Promise<FacturaAggregateRow[]> {
    const where = buildFacturasWhereClause(params);

    // Prisma groupBy con _sum — agrupa por moneda y suma los 4 campos numéricos.
    // Cada moneda distinta genera una fila independiente.
    const rows = await this.prisma.factura.groupBy({
      by: ["moneda"],
      where,
      _sum: {
        total: true,
        subtotal: true,
        totalImpuestosTransladados: true,
        totalImpuestosRetenidos: true,
      },
      _count: { _all: true },
      orderBy: { moneda: "asc" },
    });

    return rows.map((row) => ({
      moneda: row.moneda,
      count: row._count._all,
      total: row._sum.total != null ? Number(row._sum.total) : 0,
      subtotal: row._sum.subtotal != null ? Number(row._sum.subtotal) : 0,
      totalImpuestosTransladados:
        row._sum.totalImpuestosTransladados != null
          ? Number(row._sum.totalImpuestosTransladados)
          : null,
      totalImpuestosRetenidos:
        row._sum.totalImpuestosRetenidos != null
          ? Number(row._sum.totalImpuestosRetenidos)
          : null,
    }));
  }
}


