import { PrismaClient } from "@prisma/client";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { ConflictError, ValidationError } from "@/core/shared/errors/domain";
import { VacationBalanceRepository } from "../repositories/VacationBalanceRepository.repository";
import { PrismaVacationBalanceRepository } from "../repositories/PrismaVacationBalanceRepository.repository";
import { PrismaAbsenceRecordRepository } from "../repositories/PrismaAbsenceRecordRepository.repository";
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

  /**
   * Set the manual annual quota (`diasDisponibles`). `diasTomados` is NO
   * longer a hand-entered figure: it is DERIVED from the sum of every
   * VACACIONES absence in the registry, so the balance can never drift from
   * the real history (single source of truth, agreed with the user).
   *
   * The derivation + upsert run inside ONE `$transaction` so a concurrent
   * absence insert cannot interleave and leave a stale `diasTomados`.
   */
  async set(input: {
    colaboradorId: string;
    diasDisponibles: number;
  }): Promise<Result<VacationBalanceDto, Error>> {
    // Defensive guard — the Zod validator already enforces non-negative
    // integers, but we keep a belt-and-suspenders check so a future caller
    // that bypasses the validator (e.g. a manual service call from a
    // migration script) cannot corrupt the table.
    if (input.diasDisponibles < 0) {
      return Err(
        new ValidationError(
          "VACATION_BALANCE_NEGATIVE",
          "El cupo de vacaciones no puede ser negativo"
        )
      );
    }

    try {
      const row = await this._prisma.$transaction(async (tx) => {
        const balanceRepo = new PrismaVacationBalanceRepository(tx);
        const absenceRepo = new PrismaAbsenceRecordRepository(tx);

        // Derive `diasTomados` from the registry — never trust a hand-typed
        // value. This keeps the balance consistent the moment the quota is
        // (re)set, even if absences were registered before any quota existed.
        const absences = await absenceRepo.findByColaboradorId({
          colaboradorId: input.colaboradorId,
        });
        const diasTomados = absences
          .filter((r) => r.tipo === "VACACIONES")
          .reduce((acc, r) => acc + r.dias, 0);

        // Server-side enforcement of the same rule the dialog checks: the
        // quota can never be lowered below the days already taken, otherwise
        // the balance would silently hold a negative saldo. The UI blocks it
        // too, but a tampered client or a direct action call must be rejected
        // here (defense in depth).
        if (input.diasDisponibles < diasTomados) {
          throw new ValidationError(
            "VACATION_QUOTA_BELOW_TAKEN",
            `El cupo (${input.diasDisponibles}) no puede ser menor a los ${diasTomados} días de vacaciones ya registrados. ` +
              `Reduce las vacaciones registradas o sube el cupo.`
          );
        }

        return balanceRepo.upsert({
          colaboradorId: input.colaboradorId,
          diasDisponibles: input.diasDisponibles,
          diasTomados,
        });
      });
      return Ok(toVacationBalanceDto(row));
    } catch (error) {
      if (error instanceof ValidationError) {
        return Err(error);
      }
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