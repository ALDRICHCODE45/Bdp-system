import { FacturaHistorial } from "@prisma/client";
import { FacturaHistorialDto } from "../dtos/FacturaHistorialDto.dto";

export function toFacturaHistorialDto(
  historial: FacturaHistorial
): FacturaHistorialDto {
  return {
    id: historial.id,
    facturaId: historial.facturaId,
    campo: historial.campo,
    valorAnterior: historial.valorAnterior,
    valorNuevo: historial.valorNuevo,
    usuarioId: historial.usuarioId,
    motivo: historial.motivo,
    fechaCambio: historial.fechaCambio.toISOString(),
  };
}

export function toFacturaHistorialDtoArray(
  historialArray: FacturaHistorial[]
): FacturaHistorialDto[] {
  return historialArray.map(toFacturaHistorialDto);
}

