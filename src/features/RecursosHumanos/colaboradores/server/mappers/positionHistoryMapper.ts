import type { ColaboradorPositionHistory } from "@prisma/client";
import type { PositionHistoryDto } from "../dtos/PositionHistoryDto.dto";

/**
 * Map a single Prisma `ColaboradorPositionHistory` row into the typed DTO
 * that travels to the client. The DTO is a structural superset of the
 * Prisma fields minus the runtime-coupled `Date` types — these are
 * serialized to ISO strings so the mapper is the ONLY place where that
 * conversion happens (CC7).
 */
export function toPositionHistoryDto(
  row: ColaboradorPositionHistory
): PositionHistoryDto {
  return {
    id: row.id,
    colaboradorId: row.colaboradorId,
    fechaEfectiva: row.fechaEfectiva.toISOString(),
    cargo: row.cargo,
    departamento: row.departamento ?? null,
    nivel: row.nivel ?? null,
    motivo: row.motivo ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * Map an array of Prisma rows to DTOs. Mirrors the helper naming used in
 * `salaryHistoryMapper` / `emergencyContactMapper`.
 */
export function toPositionHistoryDtoArray(
  rows: ColaboradorPositionHistory[]
): PositionHistoryDto[] {
  return rows.map(toPositionHistoryDto);
}