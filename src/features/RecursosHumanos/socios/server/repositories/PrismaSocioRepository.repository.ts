import { PrismaClient } from "@prisma/client";
import {
  SocioRepository,
  SocioEntity,
  CreateSocioArgs,
  UpdateSocioArgs,
} from "./SocioRepository.repository";

export class PrismaSocioRepository implements SocioRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateSocioArgs): Promise<SocioEntity> {
    return await this.prisma.socio.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        activo: data.activo,
        fechaIngreso: data.fechaIngreso,
        departamento: data.departamento,
        notas: data.notas,
      },
    });
  }

  async update(data: UpdateSocioArgs): Promise<SocioEntity> {
    return await this.prisma.socio.update({
      where: { id: data.id },
      data: {
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        activo: data.activo,
        fechaIngreso: data.fechaIngreso,
        departamento: data.departamento,
        notas: data.notas,
      },
    });
  }

  async delete(data: { id: string }): Promise<void> {
    await this.prisma.socio.delete({
      where: { id: data.id },
    });
  }

  async findById(data: { id: string }): Promise<SocioEntity | null> {
    return await this.prisma.socio.findUnique({
      where: { id: data.id },
    });
  }

  async findByEmail(data: { email: string }): Promise<boolean> {
    const socio = await this.prisma.socio.findUnique({
      where: { email: data.email },
    });
    return !!socio;
  }

  async getAll(): Promise<SocioEntity[]> {
    const socios = await this.prisma.socio.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: { colaboradores: true },
        },
      },
    });

    // Remapeamos cada socio para exponer `count` en vez de `_count.colaboradores`
    return socios.map((socio) => ({
      ...socio,
      numeroEmpleados: socio._count?.colaboradores ?? 0,
    }));
  }

  async countColaboradores(data: { id: string }): Promise<number> {
    return await this.prisma.colaborador.count({
      where: { socioId: data.id },
    });
  }
}
