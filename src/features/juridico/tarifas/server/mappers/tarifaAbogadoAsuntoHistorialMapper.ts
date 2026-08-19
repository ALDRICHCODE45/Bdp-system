import type { TarifaAbogadoAsuntoHistorialDto } from "../dtos/TarifaAbogadoAsuntoHistorialDto.dto";
import type { TarifaAbogadoAsuntoHistorialEntity } from "../repositories/TarifaAbogadoAsuntoHistorialRepository.repository";

export function toTarifaAbogadoAsuntoHistorialDto(
  entity: TarifaAbogadoAsuntoHistorialEntity,
): TarifaAbogadoAsuntoHistorialDto {
  return {
    id: entity.id,
    tarifaId: entity.tarifaId,
    tarifaHoraAnterior:
      entity.tarifaHoraAnterior === null
        ? null
        : entity.tarifaHoraAnterior.toString(),
    tarifaHoraNueva: entity.tarifaHoraNueva.toString(),
    changedById: entity.changedById,
    changedByNombre: entity.changedBy.name,
    motivo: entity.motivo ?? null,
    changedAt: entity.changedAt.toISOString(),
  };
}

export function toTarifaAbogadoAsuntoHistorialDtoArray(
  entities: TarifaAbogadoAsuntoHistorialEntity[],
): TarifaAbogadoAsuntoHistorialDto[] {
  return entities.map(toTarifaAbogadoAsuntoHistorialDto);
}
