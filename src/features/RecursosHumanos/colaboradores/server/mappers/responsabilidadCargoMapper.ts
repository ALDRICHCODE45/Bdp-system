import type { ResponsabilidadCargo } from "@prisma/client";
import type { ResponsabilidadCargoDto } from "../dtos/ResponsabilidadCargoDto.dto";

/**
 * Map a single Prisma `ResponsabilidadCargo` row into the typed DTO that
 * travels to the client. Date fields are serialized to ISO strings so the
 * mapper is the single source of truth for that conversion (CC7).
 */
export function toResponsabilidadCargoDto(
  row: ResponsabilidadCargo
): ResponsabilidadCargoDto {
  return {
    id: row.id,
    colaboradorId: row.colaboradorId,
    descripcion: row.descripcion,
    orden: row.orden,
    completada: row.completada,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toResponsabilidadCargoDtoArray(
  rows: ResponsabilidadCargo[]
): ResponsabilidadCargoDto[] {
  return rows.map(toResponsabilidadCargoDto);
}
