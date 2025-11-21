import type { IngresoHistorialDto } from "../dtos/IngresoHistorialDto.dto";
import type { IngresoHistorial } from "@prisma/client";

/**
 * Convierte un registro de historial de Prisma a IngresoHistorialDto
 * @param historial - Registro de historial de Prisma
 * @returns IngresoHistorialDto
 */
export function toIngresoHistorialDto(
  historial: IngresoHistorial
): IngresoHistorialDto {
  return {
    id: historial.id,
    ingresoId: historial.ingresoId,
    campo: historial.campo,
    valorAnterior: historial.valorAnterior,
    valorNuevo: historial.valorNuevo,
    usuarioId: historial.usuarioId,
    motivo: historial.motivo,
    fechaCambio: historial.fechaCambio.toISOString(),
  };
}

/**
 * Convierte un array de registros de historial de Prisma a IngresoHistorialDto[]
 * @param historiales - Array de registros de historial de Prisma
 * @returns Array de IngresoHistorialDto
 */
export function toIngresoHistorialDtoArray(
  historiales: IngresoHistorial[]
): IngresoHistorialDto[] {
  return historiales.map(toIngresoHistorialDto);
}

