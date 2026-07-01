import { PrismaClient } from "@prisma/client";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { ConflictError, ValidationError } from "@/core/shared/errors/domain";
import { VacationBalanceRepository } from "../repositories/VacationBalanceRepository.repository";
import { toVacationBalanceDto } from "../mappers/vacationBalanceMapper";
import type { VacationBalanceDto } from "../dtos/VacationBalanceDto.dto";

/**
 * Service-layer shape for the VacationBalance feature (cap9 req1).
 *
 * Public methods:
 * - `getByColaborador` — read; returns `null` when no balance has been
 *   registered yet. The Resumen KPI card and the Ausencias donut chart
 *   BOTH depend on the `null` signal to render their empty states
 *   (cap3 req4 + cap9 req5 — NEVER fabricate a "0/0" total).
 * - `set` — mutating; upserts the 1:1 balance row. The 1:1 @unique
 *   constraint means we MUST use upsert semantics — a plain `create` would
 *   collide on the second call. The repo uses Prisma's `upsert` which is
 *   atomic at the DB layer (Postgres `ON CONFLICT`), so concurrent calls
 *   are race-safe.
 *
 *   Defensive programming: we still wrap the upsert in try/catch and
 *   surface a typed `ConflictError` if a Prisma P2002 ever escapes (CC2 /
 *   Design Risk P6 — "On CONFLICT race, return typed ConflictError, NOT a
 *   raw throw").
 *
 * Returns `Result<T, Error>` everywhere — never throws outside the Server
 * Action boundary (CC2).
 */
export class VacationBalanceService {
  constructor(
    private readonly repository: VacationBalanceRepository,
    private readonly _prisma: PrismaClient
  ) {}

  async getByColaborador(
    colaboradorId: string
  ): Promise<Result<VacationBalanceDto | null, Error>> {
    try {
      const row = await this.repository.findByColaboradorId({ colaboradorId });
      return Ok(row ? toVacationBalanceDto(row) : null);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener el balance de vacaciones")
      );
    }
  }

  async set(input: {
    colaboradorId: string;
    diasDisponibles: number;
    diasTomados: number;
  }): Promise<Result<VacationBalanceDto, Error>> {
    // Defensive guard — the Zod validator already enforces non-negative
    // integers, but we keep a belt-and-suspenders check so a future caller
    // that bypasses the validator (e.g. a manual service call from a
    // migration script) cannot corrupt the table.
    if (input.diasDisponibles < 0 || input.diasTomados < 0) {
      return Err(
        new ValidationError(
          "VACATION_BALANCE_NEGATIVE",
          "Los días disponibles y tomados no pueden ser negativos"
        )
      );
    }

    try {
      const row = await this.repository.upsert({
        colaboradorId: input.colaboradorId,
        diasDisponibles: input.diasDisponibles,
        diasTomados: input.diasTomados,
      });
      return Ok(toVacationBalanceDto(row));
    } catch (error) {
      // Prisma P2002 = unique constraint violation. With the atomic upsert
      // this should never fire, but if it ever does we surface a typed
      // ConflictError instead of leaking the raw Prisma error (CC2 / DR P6).
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code?: string }).code === "P2002"
      ) {
        return Err(
          new ConflictError(
            "VACATION_BALANCE_CONFLICT",
            "Ya existe un balance de vacaciones para este colaborador"
          )
        );
      }
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al registrar el balance de vacaciones")
      );
    }
  }
}