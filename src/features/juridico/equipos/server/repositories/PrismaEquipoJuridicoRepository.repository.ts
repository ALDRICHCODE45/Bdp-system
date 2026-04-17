import { PrismaClient } from "@prisma/client";
import type {
  EquipoJuridicoRepository,
  EquipoJuridicoEntity,
  CreateEquipoJuridicoArgs,
  UpdateEquipoJuridicoArgs,
} from "./EquipoJuridicoRepository.repository";

const equipoIncludes = {
  miembros: {
    include: {
      usuario: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

export class PrismaEquipoJuridicoRepository
  implements EquipoJuridicoRepository
{
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateEquipoJuridicoArgs): Promise<EquipoJuridicoEntity> {
    return await this.prisma.equipoJuridico.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
      },
      include: equipoIncludes,
    });
  }

  async update(data: UpdateEquipoJuridicoArgs): Promise<EquipoJuridicoEntity> {
    return await this.prisma.equipoJuridico.update({
      where: { id: data.id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
      },
      include: equipoIncludes,
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.equipoJuridico.update({
      where: { id },
      data: { activo: false },
    });
  }

  async findById(id: string): Promise<EquipoJuridicoEntity | null> {
    return await this.prisma.equipoJuridico.findUnique({
      where: { id },
      include: equipoIncludes,
    });
  }

  async findByNombre(nombre: string): Promise<EquipoJuridicoEntity | null> {
    return await this.prisma.equipoJuridico.findFirst({
      where: {
        nombre,
        activo: true,
      },
      include: equipoIncludes,
    });
  }

  async getAll(): Promise<EquipoJuridicoEntity[]> {
    return await this.prisma.equipoJuridico.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
      include: equipoIncludes,
    });
  }

  async addMiembro(equipoId: string, usuarioId: string): Promise<void> {
    await this.prisma.equipoJuridicoUsuario.create({
      data: { equipoId, usuarioId },
    });
  }

  async removeMiembro(equipoId: string, usuarioId: string): Promise<void> {
    await this.prisma.equipoJuridicoUsuario.delete({
      where: {
        equipoId_usuarioId: { equipoId, usuarioId },
      },
    });
  }
}
