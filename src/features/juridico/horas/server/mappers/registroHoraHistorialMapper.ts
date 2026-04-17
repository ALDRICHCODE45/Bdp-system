import type { RegistroHoraHistorial } from "@prisma/client";
import type { RegistroHoraHistorialDto } from "../dtos/RegistroHoraHistorialDto.dto";

export function toRegistroHoraHistorialDto(
  entity: RegistroHoraHistorial
): RegistroHoraHistorialDto {
  return {
    id: entity.id,
    registroHoraId: entity.registroHoraId,
    campo: entity.campo,
    valorAnterior: entity.valorAnterior ?? null,
    valorNuevo: entity.valorNuevo,
    usuarioId: entity.usuarioId ?? null,
    motivo: entity.motivo ?? null,
    fechaCambio: entity.fechaCambio.toISOString(),
  };
}

export function toRegistroHoraHistorialDtoArray(
  entities: RegistroHoraHistorial[]
): RegistroHoraHistorialDto[] {
  return entities.map(toRegistroHoraHistorialDto);
}
