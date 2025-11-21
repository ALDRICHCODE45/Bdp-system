import type { ColaboradorHistorialDto } from "../dtos/ColaboradorHistorialDto.dto";
import type { ColaboradorHistorial } from "@prisma/client";

/**
 * Convierte un registro de historial de Prisma a ColaboradorHistorialDto
 * @param historial - Registro de historial de Prisma
 * @returns ColaboradorHistorialDto
 */
export function toColaboradorHistorialDto(
  historial: ColaboradorHistorial
): ColaboradorHistorialDto {
  return {
    id: historial.id,
    colaboradorId: historial.colaboradorId,
    campo: historial.campo,
    valorAnterior: historial.valorAnterior,
    valorNuevo: historial.valorNuevo,
    usuarioId: historial.usuarioId,
    motivo: historial.motivo,
    fechaCambio: historial.fechaCambio.toISOString(),
  };
}

/**
 * Convierte un array de registros de historial de Prisma a ColaboradorHistorialDto[]
 * @param historiales - Array de registros de historial de Prisma
 * @returns Array de ColaboradorHistorialDto
 */
export function toColaboradorHistorialDtoArray(
  historiales: ColaboradorHistorial[]
): ColaboradorHistorialDto[] {
  return historiales.map(toColaboradorHistorialDto);
}

