import type { ClienteProveedorHistorialDto } from "../dtos/ClienteProveedorHistorialDto.dto";
import type { ClienteProveedorHistorial } from "@prisma/client";

/**
 * Convierte un registro de historial de Prisma a ClienteProveedorHistorialDto
 * @param historial - Registro de historial de Prisma
 * @returns ClienteProveedorHistorialDto
 */
export function toClienteProveedorHistorialDto(
  historial: ClienteProveedorHistorial
): ClienteProveedorHistorialDto {
  return {
    id: historial.id,
    clienteProveedorId: historial.clienteProveedorId,
    campo: historial.campo,
    valorAnterior: historial.valorAnterior,
    valorNuevo: historial.valorNuevo,
    usuarioId: historial.usuarioId,
    motivo: historial.motivo,
    fechaCambio: historial.fechaCambio.toISOString(),
  };
}

/**
 * Convierte un array de registros de historial de Prisma a ClienteProveedorHistorialDto[]
 * @param historiales - Array de registros de historial de Prisma
 * @returns Array de ClienteProveedorHistorialDto
 */
export function toClienteProveedorHistorialDtoArray(
  historiales: ClienteProveedorHistorial[]
): ClienteProveedorHistorialDto[] {
  return historiales.map(toClienteProveedorHistorialDto);
}

