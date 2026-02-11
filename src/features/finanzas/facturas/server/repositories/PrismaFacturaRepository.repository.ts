import { PrismaClient } from "@prisma/client";
import {
  FacturaRepository,
  FacturaEntity,
  CreateFacturaArgs,
  UpdateFacturaArgs,
} from "./FacturaRepository.repository";
import { Decimal } from "@prisma/client/runtime/library";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export class PrismaFacturaRepository implements FacturaRepository {
  constructor(
    private prisma: PrismaClient | PrismaTransactionClient
  ) {}

  async create(data: CreateFacturaArgs): Promise<FacturaEntity> {
    const factura = await this.prisma.factura.create({
      data: {
        tipoOrigen: data.tipoOrigen,
        origenId: data.origenId,
        clienteProveedorId: data.clienteProveedorId,
        clienteProveedor: data.clienteProveedor,
        concepto: data.concepto,
        monto: new Decimal(data.monto),
        periodo: data.periodo,
        numeroFactura: data.numeroFactura,
        folioFiscal: data.folioFiscal,
        fechaEmision: data.fechaEmision,
        fechaVencimiento: data.fechaVencimiento,
        estado: data.estado,
        formaPago: data.formaPago,
        rfcEmisor: data.rfcEmisor,
        rfcReceptor: data.rfcReceptor,
        direccionEmisor: data.direccionEmisor,
        direccionReceptor: data.direccionReceptor,
        numeroCuenta: data.numeroCuenta,
        clabe: data.clabe,
        banco: data.banco,
        fechaPago: data.fechaPago,
        fechaRegistro: data.fechaRegistro,
        creadoPorId: data.creadoPorId,
        autorizadoPorId: data.autorizadoPorId,
        notas: data.notas,
        ingresadoPor: data.ingresadoPor,
      },
      include: {
        clienteProveedorRef: true,
        ingresadoPorRef: true,
        creadoPorRef: true,
        autorizadoPorRef: true,
      },
    });

    return factura;
  }

  async update(data: UpdateFacturaArgs): Promise<FacturaEntity> {
    const factura = await this.prisma.factura.update({
      where: { id: data.id },
      data: {
        tipoOrigen: data.tipoOrigen,
        origenId: data.origenId,
        clienteProveedorId: data.clienteProveedorId,
        clienteProveedor: data.clienteProveedor,
        concepto: data.concepto,
        monto: new Decimal(data.monto),
        periodo: data.periodo,
        numeroFactura: data.numeroFactura,
        folioFiscal: data.folioFiscal,
        fechaEmision: data.fechaEmision,
        fechaVencimiento: data.fechaVencimiento,
        estado: data.estado,
        formaPago: data.formaPago,
        rfcEmisor: data.rfcEmisor,
        rfcReceptor: data.rfcReceptor,
        direccionEmisor: data.direccionEmisor,
        direccionReceptor: data.direccionReceptor,
        numeroCuenta: data.numeroCuenta,
        clabe: data.clabe,
        banco: data.banco,
        fechaPago: data.fechaPago,
        fechaRegistro: data.fechaRegistro,
        creadoPorId: data.creadoPorId,
        autorizadoPorId: data.autorizadoPorId,
        notas: data.notas,
      },
      include: {
        clienteProveedorRef: true,
        ingresadoPorRef: true,
        creadoPorRef: true,
        autorizadoPorRef: true,
      },
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
      include: {
        clienteProveedorRef: true,
        ingresadoPorRef: true,
        creadoPorRef: true,
        autorizadoPorRef: true,
      },
    });

    return factura;
  }

  async findByFolioFiscal(folioFiscal: string): Promise<boolean> {
    const factura = await this.prisma.factura.findUnique({
      where: { folioFiscal },
    });

    return factura !== null;
  }

  async findByOrigenId(origenId: string): Promise<FacturaEntity[]> {
    const facturas = await this.prisma.factura.findMany({
      where: { origenId },
      include: {
        clienteProveedorRef: true,
        ingresadoPorRef: true,
        creadoPorRef: true,
        autorizadoPorRef: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return facturas;
  }

  async getAll(): Promise<FacturaEntity[]> {
    const facturas = await this.prisma.factura.findMany({
      include: {
        clienteProveedorRef: true,
        ingresadoPorRef: true,
        creadoPorRef: true,
        autorizadoPorRef: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return facturas;
  }

  async getPaginated(params: import("@/core/shared/types/pagination.types").PaginationParams): Promise<{ data: FacturaEntity[]; totalCount: number }> {
    const skip = (params.page - 1) * params.pageSize;
    const orderBy = params.sortBy
      ? { [params.sortBy]: params.sortOrder || "desc" }
      : { createdAt: "desc" as const };

    const [data, totalCount] = await Promise.all([
      this.prisma.factura.findMany({
        skip,
        take: params.pageSize,
        orderBy,
        include: {
          clienteProveedorRef: true,
          ingresadoPorRef: true,
          creadoPorRef: true,
          autorizadoPorRef: true,
        },
      }),
      this.prisma.factura.count(),
    ]);

    return { data, totalCount };
  }
}

