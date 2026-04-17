import { PrismaClient } from "@prisma/client";
import type {
  ClienteJuridicoRepository,
  ClienteJuridicoEntity,
  CreateClienteJuridicoArgs,
  UpdateClienteJuridicoArgs,
} from "./ClienteJuridicoRepository.repository";

export class PrismaClienteJuridicoRepository
  implements ClienteJuridicoRepository
{
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateClienteJuridicoArgs): Promise<ClienteJuridicoEntity> {
    return await this.prisma.clienteJuridico.create({
      data: {
        nombre: data.nombre,
        rfc: data.rfc ?? null,
        contacto: data.contacto ?? null,
        email: data.email ?? null,
        telefono: data.telefono ?? null,
        direccion: data.direccion ?? null,
        notas: data.notas ?? null,
      },
    });
  }

  async update(data: UpdateClienteJuridicoArgs): Promise<ClienteJuridicoEntity> {
    return await this.prisma.clienteJuridico.update({
      where: { id: data.id },
      data: {
        nombre: data.nombre,
        rfc: data.rfc ?? null,
        contacto: data.contacto ?? null,
        email: data.email ?? null,
        telefono: data.telefono ?? null,
        direccion: data.direccion ?? null,
        notas: data.notas ?? null,
      },
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.clienteJuridico.update({
      where: { id },
      data: { activo: false },
    });
  }

  async findById(id: string): Promise<ClienteJuridicoEntity | null> {
    return await this.prisma.clienteJuridico.findUnique({
      where: { id },
    });
  }

  async findByNombre(nombre: string): Promise<ClienteJuridicoEntity | null> {
    return await this.prisma.clienteJuridico.findFirst({
      where: {
        nombre,
        activo: true,
      },
    });
  }

  async getAll(): Promise<ClienteJuridicoEntity[]> {
    return await this.prisma.clienteJuridico.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    });
  }
}
