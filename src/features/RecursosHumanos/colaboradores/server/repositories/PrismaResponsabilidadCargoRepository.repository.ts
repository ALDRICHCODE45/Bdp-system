import { PrismaClient } from "@prisma/client";
import {
  CreateResponsabilidadCargoArgs,
  ResponsabilidadCargoRepository,
  ToggleResponsabilidadCargoArgs,
  UpdateResponsabilidadCargoArgs,
} from "./ResponsabilidadCargoRepository.repository";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Prisma-backed implementation of ResponsabilidadCargoRepository.
 *
 * The service layer is the only consumer; the mapper at the service→DTO
 * boundary guarantees that the `@prisma/client.ResponsabilidadCargo` type
 * never reaches the client (CC7).
 */
export class PrismaResponsabilidadCargoRepository
  implements ResponsabilidadCargoRepository
{
  constructor(
    private prisma: PrismaClient | PrismaTransactionClient
  ) {}

  async create(data: CreateResponsabilidadCargoArgs) {
    return await this.prisma.responsabilidadCargo.create({
      data: {
        colaboradorId: data.colaboradorId,
        descripcion: data.descripcion,
        orden: data.orden ?? 0,
        completada: data.completada ?? false,
      },
    });
  }

  async update(data: UpdateResponsabilidadCargoArgs) {
    return await this.prisma.responsabilidadCargo.update({
      where: { id: data.id },
      data: {
        descripcion: data.descripcion,
        orden: data.orden ?? 0,
        completada: data.completada ?? false,
      },
    });
  }

  async toggleCompletada(data: ToggleResponsabilidadCargoArgs) {
    return await this.prisma.responsabilidadCargo.update({
      where: { id: data.id },
      data: { completada: data.completada },
    });
  }

  async delete(data: { id: string }): Promise<void> {
    await this.prisma.responsabilidadCargo.delete({
      where: { id: data.id },
    });
  }

  async findById(data: { id: string }) {
    return await this.prisma.responsabilidadCargo.findUnique({
      where: { id: data.id },
    });
  }

  async findByColaboradorId(data: { colaboradorId: string }) {
    return await this.prisma.responsabilidadCargo.findMany({
      where: { colaboradorId: data.colaboradorId },
      orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
    });
  }
}
