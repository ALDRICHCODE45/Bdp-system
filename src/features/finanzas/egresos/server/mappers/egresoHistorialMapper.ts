import type { EgresoHistorialDto } from "../dtos/EgresoHistorialDto.dto";
import type { EgresoHistorial } from "@prisma/client";

/**
 * Convierte un registro de historial de Prisma a EgresoHistorialDto
 * @param historial - Registro de historial de Prisma
 * @returns EgresoHistorialDto
 */
export function toEgresoHistorialDto(
  historial: EgresoHistorial
): EgresoHistorialDto {
  return {
    id: historial.id,
    egresoId: historial.egresoId,
    campo: historial.campo,
    valorAnterior: historial.valorAnterior,
    valorNuevo: historial.valorNuevo,
    usuarioId: historial.usuarioId,
    motivo: historial.motivo,
    fechaCambio: historial.fechaCambio.toISOString(),
  };
}

/**
 * Convierte un array de registros de historial de Prisma a EgresoHistorialDto[]
 * @param historiales - Array de registros de historial de Prisma
 * @returns Array de EgresoHistorialDto
 */
export function toEgresoHistorialDtoArray(
  historiales: EgresoHistorial[]
): EgresoHistorialDto[] {
  return historiales.map(toEgresoHistorialDto);
}

