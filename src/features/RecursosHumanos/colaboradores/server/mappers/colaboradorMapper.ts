import type { ColaboradorDto } from "../dtos/ColaboradorDto.dto";
import type { ColaboradorWithSocio } from "../repositories/ColaboradorRepository.repository";

/**
 * Convierte un colaborador de Prisma (con relación de socio) a ColaboradorDto
 * @param colaborador - Colaborador de Prisma con socio incluido
 * @returns ColaboradorDto
 */
export function toColaboradorDto(
  colaborador: ColaboradorWithSocio
): ColaboradorDto {
  return {
    id: colaborador.id,
    name: colaborador.name,
    correo: colaborador.correo,
    puesto: colaborador.puesto,
    status: colaborador.status,
    imss: colaborador.imss,
    socioId: colaborador.socioId,
    socio: colaborador.socio,
    banco: colaborador.banco,
    clabe: colaborador.clabe,
    sueldo: colaborador.sueldo.toString(), // Convertir Decimal a string
    activos: colaborador.activos,
    createdAt: colaborador.createdAt.toISOString(),
    updatedAt: colaborador.updatedAt.toISOString(),
  };
}

/**
 * Convierte un array de colaboradores de Prisma a ColaboradorDto[]
 * @param colaboradores - Array de colaboradores de Prisma
 * @returns Array de ColaboradorDto
 */
export function toColaboradorDtoArray(
  colaboradores: ColaboradorWithSocio[]
): ColaboradorDto[] {
  return colaboradores.map(toColaboradorDto);
}
