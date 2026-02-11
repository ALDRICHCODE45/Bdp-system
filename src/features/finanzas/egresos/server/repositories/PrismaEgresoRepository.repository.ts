import { PrismaClient } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import {
  EgresoRepository,
  EgresoEntity,
  CreateEgresoArgs,
  UpdateEgresoArgs,
} from "./EgresoRepository.repository";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export class PrismaEgresoRepository implements EgresoRepository {
  constructor(
    private prisma: PrismaClient | PrismaTransactionClient
  ) {}

  async create(data: CreateEgresoArgs): Promise<EgresoEntity> {
    return await this.prisma.egreso.create({
      data: {
        concepto: data.concepto,
        clasificacion: data.clasificacion,
        categoria: data.categoria,
        proveedor: data.proveedor,
        proveedorId: data.proveedorId,
        solicitanteId: data.solicitanteId,
        autorizadorId: data.autorizadorId,
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
        clienteProyecto: data.clienteProyecto ?? null,
        clienteProyectoId: data.clienteProyectoId ?? null,
        notas: data.notas,
        ingresadoPor: data.ingresadoPor,
      },
      include: {
        proveedorRef: true,
        clienteProyectoRef: true,
        ingresadoPorRef: true,
        solicitanteRef: true,
        autorizadorRef: true,
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
        solicitanteId: data.solicitanteId,
        autorizadorId: data.autorizadorId,
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
        clienteProyecto: data.clienteProyecto ?? null,
        clienteProyectoId: data.clienteProyectoId ?? null,
        notas: data.notas,
      },
      include: {
        proveedorRef: true,
        clienteProyectoRef: true,
        ingresadoPorRef: true,
        solicitanteRef: true,
        autorizadorRef: true,
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
        ingresadoPorRef: true,
        solicitanteRef: true,
        autorizadorRef: true,
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
        ingresadoPorRef: true,
        solicitanteRef: true,
        autorizadorRef: true,
      },
    });
  }

  async getPaginated(params: import("@/core/shared/types/pagination.types").PaginationParams): Promise<{ data: EgresoEntity[]; totalCount: number }> {
    const skip = (params.page - 1) * params.pageSize;
    const orderBy = params.sortBy
      ? { [params.sortBy]: params.sortOrder || "desc" }
      : { createdAt: "desc" as const };

    const [data, totalCount] = await Promise.all([
      this.prisma.egreso.findMany({
        skip,
        take: params.pageSize,
        orderBy,
        include: {
          proveedorRef: true,
          clienteProyectoRef: true,
          ingresadoPorRef: true,
          solicitanteRef: true,
          autorizadorRef: true,
        },
      }),
      this.prisma.egreso.count(),
    ]);

    return { data, totalCount };
  }
}

