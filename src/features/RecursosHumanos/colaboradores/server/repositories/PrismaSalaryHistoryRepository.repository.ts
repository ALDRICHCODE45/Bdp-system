import { PrismaClient } from "@prisma/client";
import {
  CreateSalaryHistoryArgs,
  SalaryHistoryRepository,
} from "./SalaryHistoryRepository.repository";

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
 * Prisma-backed implementation of SalaryHistoryRepository.
 *
 * The service layer is the only consumer that calls into this class — the
 * mapper at the service→DTO boundary guarantees that the
 * `@prisma/client.ColaboradorSalaryHistory` type never reaches the client
 * (CC7).
 */
export class PrismaSalaryHistoryRepository implements SalaryHistoryRepository {
  constructor(
    private prisma: PrismaClient | PrismaTransactionClient
  ) {}

  async create(data: CreateSalaryHistoryArgs) {
    return await this.prisma.colaboradorSalaryHistory.create({
      data: {
        colaboradorId: data.colaboradorId,
        fechaEfectiva: data.fechaEfectiva,
        monto: data.monto,
        moneda: data.moneda ?? "MXN",
        motivo: data.motivo ?? null,
      },
    });
  }

  async findById(data: { id: string }) {
    return await this.prisma.colaboradorSalaryHistory.findUnique({
      where: { id: data.id },
    });
  }

  async findByColaboradorId(data: { colaboradorId: string }) {
    return await this.prisma.colaboradorSalaryHistory.findMany({
      where: { colaboradorId: data.colaboradorId },
      orderBy: { fechaEfectiva: "desc" },
    });
  }
}