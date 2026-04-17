import type { AsuntoJuridicoDto } from "../dtos/AsuntoJuridicoDto.dto";
import type { AsuntoJuridicoEntity } from "../repositories/AsuntoJuridicoRepository.repository";

/**
 * Convierte un AsuntoJuridico de Prisma a AsuntoJuridicoDto
 * @param entity - AsuntoJuridico de Prisma con relaciones
 * @returns AsuntoJuridicoDto
 */
export function toAsuntoJuridicoDto(
  entity: AsuntoJuridicoEntity
): AsuntoJuridicoDto {
  return {
    id: entity.id,
    nombre: entity.nombre,
    descripcion: entity.descripcion ?? null,
    estado: entity.estado,
    clienteJuridicoId: entity.clienteJuridicoId,
    clienteJuridicoNombre: entity.clienteJuridico?.nombre ?? null,
    socioId: entity.socioId,
    socioNombre: entity.socio?.nombre ?? null,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

/**
 * Convierte un array de AsuntoJuridico de Prisma a AsuntoJuridicoDto[]
 * @param entities - Array de AsuntoJuridico de Prisma con relaciones
 * @returns Array de AsuntoJuridicoDto
 */
export function toAsuntoJuridicoDtoArray(
  entities: AsuntoJuridicoEntity[]
): AsuntoJuridicoDto[] {
  return entities.map(toAsuntoJuridicoDto);
}
