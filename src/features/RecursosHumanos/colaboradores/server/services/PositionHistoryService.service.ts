import { NivelSeniority, PrismaClient } from "@prisma/client";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { PositionHistoryRepository } from "../repositories/PositionHistoryRepository.repository";
import {
  toPositionHistoryDto,
  toPositionHistoryDtoArray,
} from "../mappers/positionHistoryMapper";
import type { PositionHistoryDto } from "../dtos/PositionHistoryDto.dto";

/**
 * Service-layer shape for the PositionHistory feature (cap6 + cap5).
 *
 * Public methods:
 * - `listByColaborador` — read; no mutations.
 * - `adjustPosition` — mutating; updates the live `Colaborador` position
 *   fields (cargo/puesto, departamento, nivel) AND appends a PositionHistory
 *   row in a single `$transaction` (CC5 / cap6 req5 / cap5 req6).
 *
 * IMPORTANT: this `adjustPosition` is the explicit, user-facing write path
 * for the Compensación tab. It captures the PREVIOUS cargo/departamento/nivel
 * values in the history row (snapshot BEFORE the update), mirroring the
 * P3 `hasPositionChanged` semantic in `ColaboradorService.update`. The two
 * code paths are independent so they DO NOT collide — `adjustPosition` is
 * what the Compensación tab calls, and the P3 auto-write fires only when the
 * EditColaboradorSheet goes through `updateColaboradorAction`.
 */
export class PositionHistoryService {
  constructor(
    private readonly repository: PositionHistoryRepository,
    private readonly prisma: PrismaClient
  ) {}

  async listByColaborador(
    colaboradorId: string
  ): Promise<Result<PositionHistoryDto[], Error>> {
    try {
      const rows = await this.repository.findByColaboradorId({ colaboradorId });
      return Ok(toPositionHistoryDtoArray(rows));
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener historial de posición")
      );
    }
  }

  /**
   * Apply a position adjustment (CC5 / cap6 req5 / cap5 req6).
   *
   * Wraps BOTH writes in a single `prisma.$transaction`:
   *   1. `prisma.colaborador.update({ where: { id }, data: { puesto, departamento, nivel } })`
   *   2. `prisma.colaboradorPositionHistory.create({ ... })` capturing the
   *      PREVIOUS values (snapshot taken inside the tx, before the update).
   *
   * On any throw inside the tx callback, Prisma rolls back the ENTIRE
   * transaction — neither the position fields nor a PositionHistory row
   * leaks out as a partial write when validation/insertion fails downstream.
   */
  async adjustPosition(input: {
    colaboradorId: string;
    fechaEfectiva: Date;
    cargo: string;
    departamento?: string | null;
    nivel?: NivelSeniority | null;
    motivo?: string | null;
  }): Promise<Result<PositionHistoryDto, Error>> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const existing = await tx.colaborador.findUnique({
          where: { id: input.colaboradorId },
          select: {
            id: true,
            puesto: true,
            departamento: true,
            nivel: true,
          },
        });
        if (!existing) {
          throw new Error("Colaborador no encontrado");
        }

        // Snapshot of the PREVIOUS position values BEFORE we overwrite them.
        // We feed these into the history row so the audit trail records what
        // the colaborador was BEFORE this adjustment (per cap6 req5 / cap5
        // req6 wording: history shows the position AT TIME OF CHANGE).
        const previousCargo = existing.puesto;
        const previousDepartamento = existing.departamento ?? null;
        const previousNivel = existing.nivel ?? null;

        // 1. Update the live Colaborador position fields.
        await tx.colaborador.update({
          where: { id: input.colaboradorId },
          data: {
            puesto: input.cargo,
            departamento: input.departamento ?? null,
            nivel: input.nivel ?? null,
          },
        });

        // 2. Append the audited PositionHistory row with the PREVIOUS
        //    values + the user-provided fechaEfectiva + motivo.
        const historyRow = await tx.colaboradorPositionHistory.create({
          data: {
            colaboradorId: input.colaboradorId,
            fechaEfectiva: input.fechaEfectiva,
            cargo: previousCargo,
            departamento: previousDepartamento,
            nivel: previousNivel,
            motivo: input.motivo ?? null,
          },
        });

        return toPositionHistoryDto(historyRow);
      });

      return Ok(result);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al registrar el ajuste de posición")
      );
    }
  }
}