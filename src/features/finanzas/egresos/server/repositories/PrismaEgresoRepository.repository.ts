import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import {
  EgresoRepository,
  EgresoEntity,
  CreateEgresoArgs,
  UpdateEgresoArgs,
} from "./EgresoRepository.repository";

export class PrismaEgresoRepository implements EgresoRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateEgresoArgs): Promise<EgresoEntity> {
    return await this.prisma.egreso.create({
      data: {
        concepto: data.concepto,
        clasificacion: data.clasificacion,
        categoria: data.categoria,
        proveedor: data.proveedor,
        proveedorId: data.proveedorId,
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
        clienteProyectoId: data.clienteProyectoId,
        notas: data.notas,
      },
      include: {
        proveedorRef: true,
        clienteProyectoRef: true,
      },
    });
  }

  async update(data: UpdateEgresoArgs): Promise<EgresoEntity> {
    return await this.prisma.egreso.update({
      where: { id: data.id },
      data: {
        concepto: data.concepto,
        clasificacion: data.clasificacion,
        categoria: data.categoria,
        proveedor: data.proveedor,
        proveedorId: data.proveedorId,
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
        clienteProyectoId: data.clienteProyectoId,
        notas: data.notas,
      },
      include: {
        proveedorRef: true,
        clienteProyectoRef: true,
      },
    });
  }

  async delete(data: { id: string }): Promise<void> {
    await this.prisma.egreso.delete({
      where: { id: data.id },
    });
  }

  async findById(data: { id: string }): Promise<EgresoEntity | null> {
    return await this.prisma.egreso.findUnique({
      where: { id: data.id },
      include: {
        proveedorRef: true,
        clienteProyectoRef: true,
      },
    });
  }

  async findByFolioFiscal(folioFiscal: string): Promise<boolean> {
    const egreso = await this.prisma.egreso.findFirst({
      where: {
        folioFiscal: folioFiscal,
      },
    });
    return !!egreso;
  }

  async getAll(): Promise<EgresoEntity[]> {
    return await this.prisma.egreso.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        proveedorRef: true,
        clienteProyectoRef: true,
      },
    });
  }
}

