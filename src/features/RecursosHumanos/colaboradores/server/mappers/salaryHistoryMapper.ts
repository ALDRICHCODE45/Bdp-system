import type { ColaboradorSalaryHistory } from "@prisma/client";
import type { SalaryHistoryDto } from "../dtos/SalaryHistoryDto.dto";

/**
 * Map a single Prisma `ColaboradorSalaryHistory` row into the typed DTO that
 * travels to the client. The DTO is a structural superset of the Prisma
 * fields minus the runtime-coupled `Date` and `Decimal` types — these are
 * serialized to strings so the mapper is the ONLY place where that conversion
 * happens (CC7).
 */
export function toSalaryHistoryDto(
  row: ColaboradorSalaryHistory
): SalaryHistoryDto {
  return {
    id: row.id,
    colaboradorId: row.colaboradorId,
    fechaEfectiva: row.fechaEfectiva.toISOString(),
    monto: row.monto.toString(),
    moneda: row.moneda,
    motivo: row.motivo ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * Map an array of Prisma rows to DTOs. Mirrors the helper naming used in
 * `emergencyContactMapper` / `responsabilidadCargoMapper`.
 */
export function toSalaryHistoryDtoArray(
  rows: ColaboradorSalaryHistory[]
): SalaryHistoryDto[] {
  return rows.map(toSalaryHistoryDto);
}