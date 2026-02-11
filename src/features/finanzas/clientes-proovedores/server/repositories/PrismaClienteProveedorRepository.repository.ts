import { PrismaClient } from "@prisma/client";
import {
  ClienteProveedorRepository,
  ClienteProveedorEntity,
  CreateClienteProveedorArgs,
  UpdateClienteProveedorArgs,
} from "./ClienteProveedorRepository.repository";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

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
      include: {
        socio: true,
        ingresadoPorRef: true,
      },
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
      include: {
        socio: true,
      },
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
      include: {
        socio: true,
        ingresadoPorRef: true,
      },
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

  async getPaginated(params: import("@/core/shared/types/pagination.types").PaginationParams): Promise<{ data: ClienteProveedorEntity[]; totalCount: number }> {
    const skip = (params.page - 1) * params.pageSize;
    const orderBy = params.sortBy
      ? { [params.sortBy]: params.sortOrder || "desc" }
      : { createdAt: "desc" as const };

    const [data, totalCount] = await Promise.all([
      this.prisma.clienteProveedor.findMany({
        skip,
        take: params.pageSize,
        orderBy,
        include: {
          socio: true,
          ingresadoPorRef: true,
        },
      }),
      this.prisma.clienteProveedor.count(),
    ]);

    return { data, totalCount };
  }

  async getAll(): Promise<ClienteProveedorEntity[]> {
    return await this.prisma.clienteProveedor.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        socio: true,
        ingresadoPorRef: true,
      },
    });
  }
}
