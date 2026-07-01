import { PrismaClient } from "@prisma/client";
import {
  UpsertVacationBalanceArgs,
  VacationBalanceRepository,
} from "./VacationBalanceRepository.repository";

/**
 * Local transaction-client type — same shape used across all per-feature
 * Prisma repositories in this codebase (see `EmergencyContactRepository`,
 * `PositionHistoryRepository`).
 */
type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Prisma-backed implementation of `VacationBalanceRepository`.
 *
 * The `upsert` is atomic at the DB layer — Postgres' `ON CONFLICT` resolves
 * concurrent manual-set calls without throwing P2002. The service layer still
 * wraps the call so a defensive try/catch can surface a typed `ConflictError`
 * if anything unexpected escapes (CC2 / Design Risk P6).
 */
export class PrismaVacationBalanceRepository
  implements VacationBalanceRepository
{
  constructor(
    private prisma: PrismaClient | PrismaTransactionClient
  ) {}

  async upsert(data: UpsertVacationBalanceArgs) {
    return await this.prisma.vacationBalance.upsert({
      where: { colaboradorId: data.colaboradorId },
      create: {
        colaboradorId: data.colaboradorId,
        diasDisponibles: data.diasDisponibles,
        diasTomados: data.diasTomados,
      },
      update: {
        diasDisponibles: data.diasDisponibles,
        diasTomados: data.diasTomados,
      },
    });
  }

  async findByColaboradorId(data: { colaboradorId: string }) {
    return await this.prisma.vacationBalance.findUnique({
      where: { colaboradorId: data.colaboradorId },
    });
  }
}