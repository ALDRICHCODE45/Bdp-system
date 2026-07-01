import type { VacationBalance } from "@prisma/client";
import type { VacationBalanceDto } from "../dtos/VacationBalanceDto.dto";

/**
 * Map a single Prisma `VacationBalance` row into the typed DTO that travels
 * to the client. The DTO is a structural superset of the Prisma fields minus
 * the runtime-coupled `Date` types — these are serialized to ISO strings so
 * the mapper is the ONLY place where that conversion happens (CC7).
 *
 * `diasDisponibles` and `diasTomados` pass through as plain integers.
 */
export function toVacationBalanceDto(
  row: VacationBalance
): VacationBalanceDto {
  return {
    id: row.id,
    colaboradorId: row.colaboradorId,
    diasDisponibles: row.diasDisponibles,
    diasTomados: row.diasTomados,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}