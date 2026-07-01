import { Prisma, PrismaClient } from "@prisma/client";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { SalaryHistoryRepository } from "../repositories/SalaryHistoryRepository.repository";
import {
  toSalaryHistoryDto,
  toSalaryHistoryDtoArray,
} from "../mappers/salaryHistoryMapper";
import type { SalaryHistoryDto } from "../dtos/SalaryHistoryDto.dto";

/**
 * Service-layer shape for the SalaryHistory feature (cap6 compensation-history).
 *
 * Public methods:
 * - `listByColaborador` — read; no mutations.
 * - `adjustSalary` — mutating; updates the live `Colaborador.sueldo` AND
 *   appends a SalaryHistory row in a single `$transaction` (CC5 / cap6 req4).
 *   Any throw inside the transaction propagates and Prisma rolls back BOTH
 *   writes — neither the sueldo change nor the history row leaks out as a
 *   partial write when validation/insertion fails downstream.
 *
 * Returns `Result<T, Error>` everywhere — never throws outside the Server
 * Action boundary (CC2).
 */
export class SalaryHistoryService {
  constructor(
    private readonly repository: SalaryHistoryRepository,
    private readonly prisma: PrismaClient
  ) {}

  async listByColaborador(
    colaboradorId: string
  ): Promise<Result<SalaryHistoryDto[], Error>> {
    try {
      const rows = await this.repository.findByColaboradorId({ colaboradorId });
      return Ok(toSalaryHistoryDtoArray(rows));
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener historial de sueldo")
      );
    }
  }

  /**
   * Apply a salary adjustment (CC5 / cap6 req4).
   *
   * Wraps BOTH writes in a single `prisma.$transaction`:
   *   1. `prisma.colaborador.update({ where: { id }, data: { sueldo } })`
   *   2. `prisma.colaboradorSalaryHistory.create({ ... })`
   *
   * The SalaryHistory row captures the NEW monto (post-adjustment). The
   * "previous monto" the cap6 scenario cares about is implicitly the live
   * `sueldo` BEFORE this transaction runs — once the tx commits, that field
   * holds the new value and the history row preserves the audited change
   * with `fechaEfectiva = now`.
   *
   * On any throw inside the tx callback, Prisma rolls back the ENTIRE
   * transaction: no partial `sueldo` change AND no orphaned history row.
   */
  async adjustSalary(input: {
    colaboradorId: string;
    fechaEfectiva: Date;
    monto: number;
    motivo?: string | null;
  }): Promise<Result<SalaryHistoryDto, Error>> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const existing = await tx.colaborador.findUnique({
          where: { id: input.colaboradorId },
          select: { id: true, sueldo: true },
        });
        if (!existing) {
          throw new Error("Colaborador no encontrado");
        }

        // 1. Update the live sueldo field. We use a Prisma.Decimal so the
        //    15,3 precision in the schema is preserved (avoids the JS-number
        //    precision drift that floats introduce on big values).
        await tx.colaborador.update({
          where: { id: input.colaboradorId },
          data: { sueldo: new Prisma.Decimal(input.monto) },
        });

        // 2. Append the audited SalaryHistory row. monto = the NEW value
        //    (post-adjustment). `fechaEfectiva` is what the user submitted;
        //    defaults to "today" on the UI.
        const historyRow = await tx.colaboradorSalaryHistory.create({
          data: {
            colaboradorId: input.colaboradorId,
            fechaEfectiva: input.fechaEfectiva,
            monto: new Prisma.Decimal(input.monto),
            moneda: "MXN",
            motivo: input.motivo ?? null,
          },
        });

        return toSalaryHistoryDto(historyRow);
      });

      return Ok(result);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al registrar el ajuste de sueldo")
      );
    }
  }
}