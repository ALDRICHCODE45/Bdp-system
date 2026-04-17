import type { ClienteJuridicoDto } from "../dtos/ClienteJuridicoDto.dto";
import type { ClienteJuridicoEntity } from "../repositories/ClienteJuridicoRepository.repository";

/**
 * Convierte un ClienteJuridico de Prisma a ClienteJuridicoDto
 * @param entity - ClienteJuridico de Prisma
 * @returns ClienteJuridicoDto
 */
export function toClienteJuridicoDto(
  entity: ClienteJuridicoEntity
): ClienteJuridicoDto {
  return {
    id: entity.id,
    nombre: entity.nombre,
    rfc: entity.rfc ?? null,
    contacto: entity.contacto ?? null,
    email: entity.email ?? null,
    telefono: entity.telefono ?? null,
    direccion: entity.direccion ?? null,
    notas: entity.notas ?? null,
    activo: entity.activo,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

/**
 * Convierte un array de ClienteJuridico de Prisma a ClienteJuridicoDto[]
 * @param entities - Array de ClienteJuridico de Prisma
 * @returns Array de ClienteJuridicoDto
 */
export function toClienteJuridicoDtoArray(
  entities: ClienteJuridicoEntity[]
): ClienteJuridicoDto[] {
  return entities.map(toClienteJuridicoDto);
}
