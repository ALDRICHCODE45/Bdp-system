import { PrismaClient } from "@prisma/client";
import {
  CreateEmergencyContactArgs,
  EmergencyContactRepository,
  UpdateEmergencyContactArgs,
} from "./EmergencyContactRepository.repository";

/**
 * Local transaction-client type — same shape used across all per-feature
 * Prisma repositories in this codebase (see `EmpresaRepository`,
 * `ColaboradorRepository`). Keeps the `prisma.$transaction` blocks compatible
 * with the same repo class.
 */
type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Prisma-backed implementation of EmergencyContactRepository.
 *
 * The service layer is the only consumer that calls into this class — the
 * mapper at the service→DTO boundary guarantees that the
 * `@prisma/client.EmergencyContact` type never reaches the client (CC7).
 */
export class PrismaEmergencyContactRepository
  implements EmergencyContactRepository
{
  constructor(
    private prisma: PrismaClient | PrismaTransactionClient
  ) {}

  async create(data: CreateEmergencyContactArgs) {
    return await this.prisma.emergencyContact.create({
      data: {
        colaboradorId: data.colaboradorId,
        nombre: data.nombre,
        parentesco: data.parentesco,
        telefono: data.telefono,
        email: data.email,
        notas: data.notas,
      },
    });
  }

  async update(data: UpdateEmergencyContactArgs) {
    return await this.prisma.emergencyContact.update({
      where: { id: data.id },
      data: {
        nombre: data.nombre,
        parentesco: data.parentesco,
        telefono: data.telefono,
        email: data.email,
        notas: data.notas,
      },
    });
  }

  async delete(data: { id: string }): Promise<void> {
    await this.prisma.emergencyContact.delete({
      where: { id: data.id },
    });
  }

  async findById(data: { id: string }) {
    return await this.prisma.emergencyContact.findUnique({
      where: { id: data.id },
    });
  }

  async findByColaboradorId(data: { colaboradorId: string }) {
    return await this.prisma.emergencyContact.findMany({
      where: { colaboradorId: data.colaboradorId },
      orderBy: { createdAt: "asc" },
    });
  }
}
