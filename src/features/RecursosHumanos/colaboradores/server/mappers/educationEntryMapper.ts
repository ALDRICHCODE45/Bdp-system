import type { EducationEntry } from "@prisma/client";
import type { EducationEntryDto } from "../dtos/EducationEntryDto.dto";

/**
 * Map a single Prisma `EducationEntry` row into the typed DTO that travels
 * to the client. The DTO is a structural superset of the Prisma fields minus
 * the runtime-coupled `Date` types — these are serialized to ISO strings so
 * the mapper is the ONLY place where that conversion happens (CC7).
 *
 * `anio` and `orden` are plain integers and pass through untouched.
 */
export function toEducationEntryDto(row: EducationEntry): EducationEntryDto {
  return {
    id: row.id,
    colaboradorId: row.colaboradorId,
    institucion: row.institucion,
    titulo: row.titulo,
    anio: row.anio,
    orden: row.orden,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Map an array of Prisma rows to DTOs. Re-exported alongside the single-item
 * helper for parity with the other colaboradores-feature mappers.
 */
export function toEducationEntryDtoArray(
  rows: EducationEntry[]
): EducationEntryDto[] {
  return rows.map(toEducationEntryDto);
}