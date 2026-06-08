import type { MovimientoHistorial, User } from "@prisma/client";
import type { MovimientoHistorialDto } from "../dtos/MovimientoHistorialDto.dto";

type MovimientoHistorialWithUser = MovimientoHistorial & {
  usuario?: User | null;
};

/**
 * Maps a MovimientoHistorial entity to a MovimientoHistorialDto.
 * Pure transformation — no async, no DB calls.
 */
export function toMovimientoHistorialDto(
  entity: MovimientoHistorialWithUser
): MovimientoHistorialDto {
  return {
    id: entity.id,
    movimientoId: entity.movimientoId,
    campo: entity.campo,
    valorAnterior: entity.valorAnterior,
    valorNuevo: entity.valorNuevo,
    usuarioId: entity.usuarioId,
    usuarioNombre: entity.usuario?.name ?? null,
    motivo: entity.motivo,
    fechaCambio: entity.fechaCambio.toISOString(),
  };
}

export function toMovimientoHistorialDtoArray(
  entities: MovimientoHistorialWithUser[]
): MovimientoHistorialDto[] {
  return entities.map(toMovimientoHistorialDto);
}
