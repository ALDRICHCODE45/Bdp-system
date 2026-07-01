import { PrismaClient } from "@prisma/client";
import {
  CreatePositionHistoryArgs,
  PositionHistoryRepository,
} from "./PositionHistoryRepository.repository";

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Prisma-backed implementation of PositionHistoryRepository.
 *
 * The service layer is the only consumer that calls into this class — the
 * mapper at the service→DTO boundary guarantees that the
 * `@prisma/client.ColaboradorPositionHistory` type never reaches the client
 * (CC7).
 */
export class PrismaPositionHistoryRepository
  implements PositionHistoryRepository
{
  constructor(
    private prisma: PrismaClient | PrismaTransactionClient
  ) {}

  async create(data: CreatePositionHistoryArgs) {
    return await this.prisma.colaboradorPositionHistory.create({
      data: {
        colaboradorId: data.colaboradorId,
        fechaEfectiva: data.fechaEfectiva,
        cargo: data.cargo,
        departamento: data.departamento ?? null,
        nivel: data.nivel ?? null,
        motivo: data.motivo ?? null,
      },
    });
  }

  async findById(data: { id: string }) {
    return await this.prisma.colaboradorPositionHistory.findUnique({
      where: { id: data.id },
    });
  }

  async findByColaboradorId(data: { colaboradorId: string }) {
    return await this.prisma.colaboradorPositionHistory.findMany({
      where: { colaboradorId: data.colaboradorId },
      orderBy: { fechaEfectiva: "desc" },
    });
  }
}