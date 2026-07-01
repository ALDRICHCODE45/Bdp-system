import { PrismaClient } from "@prisma/client";
import {
  AbsenceRecordRepository,
  CreateAbsenceRecordArgs,
} from "./AbsenceRecordRepository.repository";

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
 * Prisma-backed implementation of `AbsenceRecordRepository`.
 *
 * The service layer is the only consumer that calls into this class — the
 * mapper at the service→DTO boundary guarantees that the
 * `@prisma/client.AbsenceRecord` type never reaches the client (CC7).
 *
 * Note: ordering is `fechaInicio desc` so the registry renders most-recent
 * first when grouped by `tipo` in the UI (cap9 req6 SHOULD).
 */
export class PrismaAbsenceRecordRepository
  implements AbsenceRecordRepository
{
  constructor(
    private prisma: PrismaClient | PrismaTransactionClient
  ) {}

  async create(data: CreateAbsenceRecordArgs) {
    return await this.prisma.absenceRecord.create({
      data: {
        colaboradorId: data.colaboradorId,
        tipo: data.tipo,
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
        dias: data.dias,
        motivo: data.motivo ?? null,
        registradoPorId: data.registradoPorId ?? null,
      },
    });
  }

  async findByColaboradorId(data: { colaboradorId: string }) {
    return await this.prisma.absenceRecord.findMany({
      where: { colaboradorId: data.colaboradorId },
      orderBy: [{ fechaInicio: "desc" }, { createdAt: "desc" }],
    });
  }
}