import type { EquipoJuridicoDto, EquipoJuridicoMiembroDto } from "../dtos/EquipoJuridicoDto.dto";
import type { EquipoJuridicoEntity, EquipoJuridicoMiembro } from "../repositories/EquipoJuridicoRepository.repository";

/**
 * Convierte un miembro del equipo a EquipoJuridicoMiembroDto
 */
function toEquipoJuridicoMiembroDto(
  miembro: EquipoJuridicoMiembro
): EquipoJuridicoMiembroDto {
  return {
    id: miembro.id,
    usuarioId: miembro.usuarioId,
    userName: miembro.usuario.name ?? "",
    userEmail: miembro.usuario.email ?? "",
    createdAt: miembro.createdAt.toISOString(),
  };
}

/**
 * Convierte un EquipoJuridico de Prisma a EquipoJuridicoDto
 * @param entity - EquipoJuridico de Prisma con miembros incluidos
 * @returns EquipoJuridicoDto
 */
export function toEquipoJuridicoDto(
  entity: EquipoJuridicoEntity
): EquipoJuridicoDto {
  const miembros = entity.miembros.map(toEquipoJuridicoMiembroDto);
  return {
    id: entity.id,
    nombre: entity.nombre,
    descripcion: entity.descripcion ?? null,
    activo: entity.activo,
    miembros,
    miembrosCount: miembros.length,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

/**
 * Convierte un array de EquipoJuridico de Prisma a EquipoJuridicoDto[]
 * @param entities - Array de EquipoJuridico de Prisma
 * @returns Array de EquipoJuridicoDto
 */
export function toEquipoJuridicoDtoArray(
  entities: EquipoJuridicoEntity[]
): EquipoJuridicoDto[] {
  return entities.map(toEquipoJuridicoDto);
}
