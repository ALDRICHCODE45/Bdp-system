import type { TarifaAbogadoAsuntoDto } from "../dtos/TarifaAbogadoAsuntoDto.dto";
import type { TarifaAbogadoAsuntoEntity } from "../repositories/TarifaAbogadoAsuntoRepository.repository";

/**
 * Convierte un entity Prisma (con relaciones) a DTO de cliente.
 * `tarifaHora` se serializa como string para preservar la precisión
 * decimal a través de la frontera server → client.
 */
export function toTarifaAbogadoAsuntoDto(
  entity: TarifaAbogadoAsuntoEntity
): TarifaAbogadoAsuntoDto {
  return {
    id: entity.id,
    usuarioId: entity.usuarioId,
    usuarioNombre: entity.usuario.name,
    usuarioEmail: entity.usuario.email,
    asuntoJuridicoId: entity.asuntoJuridicoId,
    asuntoJuridicoNombre: entity.asuntoJuridico.nombre,
    tarifaHora: entity.tarifaHora.toString(),
    activa: entity.activa,
    createdById: entity.createdById,
    createdByNombre: entity.createdBy.name,
    updatedById: entity.updatedById,
    updatedByNombre: entity.updatedBy.name,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

export function toTarifaAbogadoAsuntoDtoArray(
  entities: TarifaAbogadoAsuntoEntity[]
): TarifaAbogadoAsuntoDto[] {
  return entities.map(toTarifaAbogadoAsuntoDto);
}
