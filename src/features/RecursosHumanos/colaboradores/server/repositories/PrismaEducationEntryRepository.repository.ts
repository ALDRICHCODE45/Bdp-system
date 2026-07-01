import { PrismaClient } from "@prisma/client";
import {
  CreateEducationEntryArgs,
  EducationEntryRepository,
  UpdateEducationEntryArgs,
} from "./EducationEntryRepository.repository";

/**
 * Local transaction-client type — same shape used across all per-feature
 * Prisma repositories in this codebase (see `EmergencyContactRepository`,
 * `PositionHistoryRepository`). Keeps `prisma.$transaction` blocks compatible
 * with the same repo class.
 */
type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Prisma-backed implementation of EducationEntryRepository.
 *
 * The service layer is the only consumer that calls into this class — the
 * mapper at the service→DTO boundary guarantees that the
 * `@prisma/client.EducationEntry` type never reaches the client (CC7).
 */
export class PrismaEducationEntryRepository
  implements EducationEntryRepository
{
  constructor(
    private prisma: PrismaClient | PrismaTransactionClient
  ) {}

  async create(data: CreateEducationEntryArgs) {
    return await this.prisma.educationEntry.create({
      data: {
        colaboradorId: data.colaboradorId,
        institucion: data.institucion,
        titulo: data.titulo,
        anio: data.anio,
        orden: data.orden ?? 0,
      },
    });
  }

  async update(data: UpdateEducationEntryArgs) {
    return await this.prisma.educationEntry.update({
      where: { id: data.id },
      data: {
        institucion: data.institucion,
        titulo: data.titulo,
        anio: data.anio,
        orden: data.orden ?? 0,
      },
    });
  }

  async delete(data: { id: string }): Promise<void> {
    await this.prisma.educationEntry.delete({
      where: { id: data.id },
    });
  }

  async findById(data: { id: string }) {
    return await this.prisma.educationEntry.findUnique({
      where: { id: data.id },
    });
  }

  async findByColaboradorId(data: { colaboradorId: string }) {
    return await this.prisma.educationEntry.findMany({
      where: { colaboradorId: data.colaboradorId },
      orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
    });
  }
}