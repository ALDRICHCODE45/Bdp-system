import type { SocioDto } from "../dtos/SocioDto.dto";
import type { SocioEntity } from "../repositories/SocioRepository.repository";

/**
 * Convierte un socio de Prisma a SocioDto
 * @param socio - Socio de Prisma
 * @returns SocioDto
 */
export function toSocioDto(socio: SocioEntity): SocioDto {
  return {
    id: socio.id,
    nombre: socio.nombre,
    email: socio.email,
    telefono: socio.telefono,
    activo: socio.activo,
    fechaIngreso: socio.fechaIngreso.toISOString(),
    departamento: socio.departamento,
    numeroEmpleados: socio.numeroEmpleados,
    notas: socio.notas,
    createdAt: socio.createdAt.toISOString(),
    updatedAt: socio.updatedAt.toISOString(),
  };
}

/**
 * Convierte un array de socios de Prisma a SocioDto[]
 * @param socios - Array de socios de Prisma
 * @returns Array de SocioDto
 */
export function toSocioDtoArray(socios: SocioEntity[]): SocioDto[] {
  return socios.map(toSocioDto);
}
