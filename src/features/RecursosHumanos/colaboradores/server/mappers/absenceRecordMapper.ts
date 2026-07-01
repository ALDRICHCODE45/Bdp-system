import type { AbsenceRecord } from "@prisma/client";
import type { AbsenceRecordDto } from "../dtos/AbsenceRecordDto.dto";

/**
 * Map a single Prisma `AbsenceRecord` row into the typed DTO that travels
 * to the client. The DTO is a structural superset of the Prisma fields minus
 * the runtime-coupled `Date` types — these are serialized to ISO strings so
 * the mapper is the ONLY place where that conversion happens (CC7).
 *
 * `dias`, `tipo`, and `registradoPorId` pass through untouched.
 */
export function toAbsenceRecordDto(row: AbsenceRecord): AbsenceRecordDto {
  return {
    id: row.id,
    colaboradorId: row.colaboradorId,
    tipo: row.tipo,
    fechaInicio: row.fechaInicio.toISOString(),
    fechaFin: row.fechaFin.toISOString(),
    dias: row.dias,
    motivo: row.motivo,
    registradoPorId: row.registradoPorId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Map an array of Prisma rows to DTOs. Re-exported alongside the single-item
 * helper for parity with the other colaboradores-feature mappers.
 */
export function toAbsenceRecordDtoArray(
  rows: AbsenceRecord[]
): AbsenceRecordDto[] {
  return rows.map(toAbsenceRecordDto);
}