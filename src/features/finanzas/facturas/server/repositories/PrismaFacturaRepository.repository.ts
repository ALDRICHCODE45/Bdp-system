import { PrismaClient, Prisma, FacturaEstado } from "@prisma/client";
import {
  FacturaRepository,
  FacturaEntity,
  CreateFacturaArgs,
  UpdateFacturaArgs,
} from "./FacturaRepository.repository";
import { Decimal } from "@prisma/client/runtime/library";
import { FacturasFilterParams } from "../../types/FacturasFilterParams";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

const facturaIncludes = {
  ingresadoPorRef: { select: { name: true } },
} as const;

const VALID_ESTADOS = new Set<string>(["BORRADOR", "ENVIADA", "PAGADA", "CANCELADA"]);

const ALLOWED_SORT_COLUMNS = new Set([
  "concepto",
  "subtotal",
  "total",
  "uuid",
  "rfcEmisor",
  "rfcReceptor",
  "moneda",
  "status",
  "createdAt",
  "updatedAt",
  "fechaPago",
  "metodoPago",
  "serie",
  "folio",
  "nombreEmisor",
  "nombreReceptor",
  "statusPago",
]);

export class PrismaFacturaRepository implements FacturaRepository {
  constructor(
    private prisma: PrismaClient | PrismaTransactionClient
  ) {}

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
    await this.prisma.factura.delete({
      where: { id: data.id },
    });
  }

  async findById(data: { id: string }): Promise<FacturaEntity | null> {
    const factura = await this.prisma.factura.findUnique({
      where: { id: data.id },
      include: facturaIncludes,
    });

    return factura;
  }

  async findByUuid(uuid: string): Promise<boolean> {
    const factura = await this.prisma.factura.findUnique({
      where: { uuid },
    });

    return factura !== null;
  }

  async getAll(): Promise<FacturaEntity[]> {
    const facturas = await this.prisma.factura.findMany({
      include: facturaIncludes,
      orderBy: {
        createdAt: "desc",
      },
    });

    return facturas;
  }

  async getPaginated(params: FacturasFilterParams): Promise<{ data: FacturaEntity[]; totalCount: number }> {
    const skip = (params.page - 1) * params.pageSize;

    const sortColumn = params.sortBy && ALLOWED_SORT_COLUMNS.has(params.sortBy)
      ? params.sortBy
      : undefined;

    const orderBy = sortColumn
      ? { [sortColumn]: params.sortOrder || "desc" }
      : { createdAt: "desc" as const };

    // Build WHERE clause
    const where: Prisma.FacturaWhereInput = {};
    const andConditions: Prisma.FacturaWhereInput[] = [];

    // Text search across multiple fields
    if (params.search) {
      andConditions.push({
        OR: [
          { concepto: { contains: params.search, mode: "insensitive" } },
          { uuid: { contains: params.search, mode: "insensitive" } },
          { rfcEmisor: { contains: params.search, mode: "insensitive" } },
          { rfcReceptor: { contains: params.search, mode: "insensitive" } },
          { nombreEmisor: { contains: params.search, mode: "insensitive" } },
          { nombreReceptor: { contains: params.search, mode: "insensitive" } },
        ],
      });
    }

    // Filter by status (UI sends lowercase, Prisma enum expects UPPERCASE)
    if (params.status) {
      const upper = params.status.toUpperCase();
      if (VALID_ESTADOS.has(upper)) {
        andConditions.push({ status: upper as FacturaEstado });
      }
    }

    // Filter by metodoPago
    if (params.metodoPago) {
      andConditions.push({
        metodoPago: params.metodoPago,
      });
    }

    // Filter by moneda
    if (params.moneda) {
      andConditions.push({
        moneda: params.moneda,
      });
    }

    // Filter by statusPago
    if (params.statusPago) {
      andConditions.push({
        statusPago: params.statusPago,
      });
    }

    // Filter by total range
    if (params.totalMin !== undefined) {
      andConditions.push({
        total: { gte: new Decimal(params.totalMin) },
      });
    }
    if (params.totalMax !== undefined) {
      andConditions.push({
        total: { lte: new Decimal(params.totalMax) },
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

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
}
