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
        fechaPago: data.fechaPago,
        fechaRegistro: data.fechaRegistro,
        creadoPor: data.creadoPor,
        autorizadoPor: data.autorizadoPor,
        notas: data.notas,
        archivoPdf: data.archivoPdf,
        archivoXml: data.archivoXml,
      },
      include: {
        clienteProveedorRef: true,
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
        fechaPago: data.fechaPago,
        fechaRegistro: data.fechaRegistro,
        creadoPor: data.creadoPor,
        autorizadoPor: data.autorizadoPor,
        notas: data.notas,
        archivoPdf: data.archivoPdf,
        archivoXml: data.archivoXml,
      },
      include: {
        clienteProveedorRef: true,
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return facturas;
  }
}

