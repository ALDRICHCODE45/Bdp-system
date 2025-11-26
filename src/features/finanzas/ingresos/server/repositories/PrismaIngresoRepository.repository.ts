import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import {
  IngresoRepository,
  IngresoEntity,
  CreateIngresoArgs,
  UpdateIngresoArgs,
} from "./IngresoRepository.repository";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export class PrismaIngresoRepository implements IngresoRepository {
  constructor(
    private prisma: PrismaClient | PrismaTransactionClient
  ) {}

  async create(data: CreateIngresoArgs): Promise<IngresoEntity> {
    return await this.prisma.ingreso.create({
      data: {
        concepto: data.concepto,
        cliente: data.cliente,
        clienteId: data.clienteId,
        solicitante: data.solicitante,
        autorizador: data.autorizador,
        numeroFactura: data.numeroFactura,
        folioFiscal: data.folioFiscal,
        periodo: data.periodo,
        formaPago: data.formaPago,
        origen: data.origen,
        numeroCuenta: data.numeroCuenta,
        clabe: data.clabe,
        cargoAbono: data.cargoAbono,
        cantidad: new Decimal(data.cantidad),
        estado: data.estado,
        fechaPago: data.fechaPago,
        fechaRegistro: data.fechaRegistro,
        facturadoPor: data.facturadoPor,
        clienteProyecto: data.clienteProyecto,
        fechaParticipacion: data.fechaParticipacion,
        facturaId: data.facturaId,
        notas: data.notas,
        ingresadoPor: data.ingresadoPor,
      },
      include: {
        clienteRef: true,
        ingresadoPorRef: true,
      },
    });
  }

  async update(data: UpdateIngresoArgs): Promise<IngresoEntity> {
    return await this.prisma.ingreso.update({
      where: { id: data.id },
      data: {
        concepto: data.concepto,
        cliente: data.cliente,
        clienteId: data.clienteId,
        solicitante: data.solicitante,
        autorizador: data.autorizador,
        numeroFactura: data.numeroFactura,
        folioFiscal: data.folioFiscal,
        periodo: data.periodo,
        formaPago: data.formaPago,
        origen: data.origen,
        numeroCuenta: data.numeroCuenta,
        clabe: data.clabe,
        cargoAbono: data.cargoAbono,
        cantidad: new Decimal(data.cantidad),
        estado: data.estado,
        fechaPago: data.fechaPago,
        fechaRegistro: data.fechaRegistro,
        facturadoPor: data.facturadoPor,
        clienteProyecto: data.clienteProyecto,
        fechaParticipacion: data.fechaParticipacion,
        facturaId: data.facturaId,
        notas: data.notas,
      },
      include: {
        clienteRef: true,
        ingresadoPorRef: true,
      },
    });
  }

  async delete(data: { id: string }): Promise<void> {
    await this.prisma.ingreso.delete({
      where: { id: data.id },
    });
  }

  async findById(data: { id: string }): Promise<IngresoEntity | null> {
    return await this.prisma.ingreso.findUnique({
      where: { id: data.id },
      include: {
        clienteRef: true,
        ingresadoPorRef: true,
      },
    });
  }

  async findByFolioFiscal(folioFiscal: string): Promise<boolean> {
    const ingreso = await this.prisma.ingreso.findFirst({
      where: {
        folioFiscal: folioFiscal,
      },
    });
    return !!ingreso;
  }

  async getAll(): Promise<IngresoEntity[]> {
    return await this.prisma.ingreso.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        clienteRef: true,
        ingresadoPorRef: true,
      },
    });
  }
}

