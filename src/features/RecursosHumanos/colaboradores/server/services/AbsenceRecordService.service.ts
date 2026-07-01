import { differenceInCalendarDays } from "date-fns";
import { PrismaClient } from "@prisma/client";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { ValidationError } from "@/core/shared/errors/domain";
import { AbsenceRecordRepository } from "../repositories/AbsenceRecordRepository.repository";
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
    // Kept for parity with the other servicios even though this service does
    // not currently open a `$transaction` block. A future "adjust absence"
    // op that also writes a SalaryHistory / PositionHistory entry will need
    // it.
    private readonly _prisma: PrismaClient
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

    // ── 3. Persist ────────────────────────────────────────────────────
    try {
      const row = await this.repository.create({
        colaboradorId: input.colaboradorId,
        tipo: input.tipo,
        fechaInicio: input.fechaInicio,
        fechaFin: input.fechaFin,
        dias,
        motivo: input.motivo ?? null,
        registradoPorId: input.registradoPorId,
      });
      return Ok(toAbsenceRecordDto(row));
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al registrar la ausencia")
      );
    }
  }
}