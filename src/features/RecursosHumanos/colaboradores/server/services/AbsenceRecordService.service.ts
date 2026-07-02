import { differenceInCalendarDays } from "date-fns";
import { PrismaClient } from "@prisma/client";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { ValidationError } from "@/core/shared/errors/domain";
import { AbsenceRecordRepository } from "../repositories/AbsenceRecordRepository.repository";
import { PrismaAbsenceRecordRepository } from "../repositories/PrismaAbsenceRecordRepository.repository";
import { PrismaVacationBalanceRepository } from "../repositories/PrismaVacationBalanceRepository.repository";
import {
  toAbsenceRecordDto,
  toAbsenceRecordDtoArray,
} from "../mappers/absenceRecordMapper";
import type { AbsenceRecordDto } from "../dtos/AbsenceRecordDto.dto";

/**
 * Service-layer shape for the AbsenceRecord feature (cap9 req3).
 *
 * Public methods:
 * - `listByColaborador` — read; no mutations.
 * - `create` — register a new absence. The service is the SOURCE OF TRUTH
 *   for the inclusive `dias` math:
 *
 *     dias = differenceInCalendarDays(fechaFin, fechaInicio) + 1
 *
 *   This guarantees calendar-day counting independent of the time-of-day
 *   stored in the DateTime columns (cap9 req3 + spec scenario: a single
 *   absence with fechaInicio=2026-07-01 and fechaFin=2026-07-05 yields
 *   `dias = 5`, NEVER negative).
 *
 *   If `fechaFin < fechaInicio`, the service returns a typed
 *   `ValidationError` instead of computing a negative `dias` (CC2 /
 *   Design Risk P6).
 *
 *   The `registradoPorId` field is REQUIRED to be the current user — the
 *   service enforces non-null so the audit trail is never blank when a
 *   session is active. Server actions that mutate here must read the
 *   `session.user.id` upstream and pass it down.
 *
 * Returns `Result<T, Error>` everywhere — never throws outside the Server
 * Action boundary (CC2).
 */
export class AbsenceRecordService {
  constructor(
    private readonly repository: AbsenceRecordRepository,
    // Used to open the `$transaction` block that atomically writes the
    // absence AND re-derives the VacationBalance's `diasTomados` when a
    // VACACIONES absence is registered.
    private readonly prisma: PrismaClient
  ) {}

  async listByColaborador(
    colaboradorId: string
  ): Promise<Result<AbsenceRecordDto[], Error>> {
    try {
      const rows = await this.repository.findByColaboradorId({ colaboradorId });
      return Ok(toAbsenceRecordDtoArray(rows));
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener las ausencias")
      );
    }
  }

  async create(input: {
    colaboradorId: string;
    tipo: "VACACIONES" | "LICENCIA" | "INCAPACIDAD";
    fechaInicio: Date;
    fechaFin: Date;
    motivo?: string | null;
    registradoPorId: string;
  }): Promise<Result<AbsenceRecordDto, Error>> {
    // ── 1. Inverted-range guard (CC2 + Design Risk P6) ───────────────
    // Spec cap9: `dias` MUST be `fechaFin - fechaInicio + 1` (inclusive,
    // calendar days). A negative `dias` would corrupt the audit trail, so
    // we reject the range BEFORE computing.
    if (input.fechaFin.getTime() < input.fechaInicio.getTime()) {
      return Err(
        new ValidationError(
          "ABSENCE_RANGE_INVERTED",
          "La fecha de fin no puede ser anterior a la fecha de inicio"
        )
      );
    }

    // ── 2. Inclusive calendar-day math ────────────────────────────────
    // `differenceInCalendarDays` from date-fns counts calendar boundaries
    // between two dates, ignoring time-of-day. So 2026-07-01..2026-07-05
    // returns 4; we add 1 to make it inclusive.
    const dias = differenceInCalendarDays(input.fechaFin, input.fechaInicio) + 1;

    // ── 3. Persist + vacation-balance sync (atomic) ───────────────────
    // For VACACIONES we couple the absence insert with a re-derivation of
    // the VacationBalance's `diasTomados` inside ONE $transaction, so the
    // balance can never drift from the registry (single source of truth).
    //
    // Business rules (agreed with the user):
    //   - `diasTomados` is ALWAYS the sum of every VACACIONES absence — it
    //     is NOT edited by hand anymore. `diasDisponibles` is the manual
    //     annual quota (cupo).
    //   - If a quota exists and the new total would exceed it, we BLOCK the
    //     registration with a typed ValidationError (never leave a negative
    //     saldo).
    //   - If NO balance/quota exists yet, we register the absence WITHOUT a
    //     cap and WITHOUT fabricating a balance row (keeps the empty-state
    //     contract of cap9 req5 intact).
    try {
      const row = await this.prisma.$transaction(async (tx) => {
        // Re-instantiate the repos bound to the transaction client so every
        // read/write below joins the same tx (same pattern as
        // ColaboradorService.create / update).
        const absenceRepo = new PrismaAbsenceRecordRepository(tx);
        const balanceRepo = new PrismaVacationBalanceRepository(tx);

        if (input.tipo === "VACACIONES") {
          // Row-lock the balance FIRST so concurrent VACACIONES inserts for
          // the same colaborador serialize on it. Under Postgres' default
          // READ COMMITTED, a plain SELECT would let two transactions read
          // the same "tomados" and both pass the cap (TOCTOU). Taking a
          // `FOR UPDATE` lock on the balance row makes the second tx wait
          // until the first commits, so the cap check sees the up-to-date
          // total. No-op when the colaborador has no balance row yet (the
          // cap only applies once a quota exists).
          await tx.$executeRaw`
            SELECT id FROM "VacationBalance"
            WHERE "colaboradorId" = ${input.colaboradorId}
            FOR UPDATE
          `;

          const balance = await balanceRepo.findByColaboradorId({
            colaboradorId: input.colaboradorId,
          });

          // Only enforce the cap when a quota has actually been registered.
          if (balance) {
            const tomadosPrevios = await this.sumDiasVacaciones(
              absenceRepo,
              input.colaboradorId
            );
            const nuevoTotal = tomadosPrevios + dias;

            if (nuevoTotal > balance.diasDisponibles) {
              const restante = Math.max(
                balance.diasDisponibles - tomadosPrevios,
                0
              );
              // Thrown to abort the tx; caught below and converted to a
              // typed Result. The message tells the user exactly how to
              // resolve it: raise the quota or shorten the absence.
              throw new ValidationError(
                "VACATION_QUOTA_EXCEEDED",
                `El colaborador tiene un cupo de ${balance.diasDisponibles} días de vacaciones y ya tomó ${tomadosPrevios}. ` +
                  `Esta ausencia agrega ${dias} día${dias === 1 ? "" : "s"}, superando el cupo. ` +
                  `Ajusta el cupo máximo o reduce los días de esta ausencia (disponibles: ${restante}).`
              );
            }
          }
        }

        const created = await absenceRepo.create({
          colaboradorId: input.colaboradorId,
          tipo: input.tipo,
          fechaInicio: input.fechaInicio,
          fechaFin: input.fechaFin,
          dias,
          motivo: input.motivo ?? null,
          registradoPorId: input.registradoPorId,
        });

        // Re-derive `diasTomados` from the registry AFTER inserting, so the
        // balance always mirrors the real total. Only touch the balance if
        // it exists — no quota means no balance row to keep in sync.
        if (input.tipo === "VACACIONES") {
          await this.syncDiasTomados(
            absenceRepo,
            balanceRepo,
            input.colaboradorId
          );
        }

        return created;
      });

      return Ok(toAbsenceRecordDto(row));
    } catch (error) {
      // The cap guard throws a ValidationError to roll back the tx; surface
      // it as-is so the action maps it to a clean client message.
      if (error instanceof ValidationError) {
        return Err(error);
      }
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al registrar la ausencia")
      );
    }
  }

  /**
   * Sum every VACACIONES absence's `dias` for a colaborador. Single chokepoint
   * for the "taken vacation days" derivation so `create`, `set` (in the
   * balance service) and any future edit/delete path all compute it the same
   * way and cannot drift. Reads through the tx-bound repo passed in.
   */
  private async sumDiasVacaciones(
    absenceRepo: PrismaAbsenceRecordRepository,
    colaboradorId: string
  ): Promise<number> {
    const records = await absenceRepo.findByColaboradorId({ colaboradorId });
    return records
      .filter((r) => r.tipo === "VACACIONES")
      .reduce((acc, r) => acc + r.dias, 0);
  }

  /**
   * Re-derive `diasTomados` from the registry and upsert it onto the balance,
   * preserving the manual `diasDisponibles` quota. No-op when no balance row
   * exists (no quota → nothing to keep in sync, and we must not fabricate a
   * balance — cap9 req5). Runs inside the caller's tx.
   */
  private async syncDiasTomados(
    absenceRepo: PrismaAbsenceRecordRepository,
    balanceRepo: PrismaVacationBalanceRepository,
    colaboradorId: string
  ): Promise<void> {
    const balance = await balanceRepo.findByColaboradorId({ colaboradorId });
    if (!balance) return;
    const tomados = await this.sumDiasVacaciones(absenceRepo, colaboradorId);
    await balanceRepo.upsert({
      colaboradorId,
      diasDisponibles: balance.diasDisponibles,
      diasTomados: tomados,
    });
  }
}