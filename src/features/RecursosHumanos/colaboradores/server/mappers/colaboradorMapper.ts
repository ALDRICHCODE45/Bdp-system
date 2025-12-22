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
    // Datos personales
    fechaIngreso: colaborador.fechaIngreso.toISOString(),
    genero: colaborador.genero ?? null,
    fechaNacimiento: colaborador.fechaNacimiento
      ? colaborador.fechaNacimiento.toISOString()
      : null,
    nacionalidad: colaborador.nacionalidad ?? null,
    estadoCivil: colaborador.estadoCivil ?? null,
    tipoSangre: colaborador.tipoSangre ?? null,
    // Contacto y dirección
    direccion: colaborador.direccion ?? null,
    telefono: colaborador.telefono ?? null,
    // Datos fiscales
    rfc: colaborador.rfc ?? null,
    curp: colaborador.curp ?? null,
    // Académicos y laborales previos
    ultimoGradoEstudios: colaborador.ultimoGradoEstudios ?? null,
    escuela: colaborador.escuela ?? null,
    ultimoTrabajo: colaborador.ultimoTrabajo ?? null,
    // Referencias personales
    nombreReferenciaPersonal: colaborador.nombreReferenciaPersonal ?? null,
    telefonoReferenciaPersonal: colaborador.telefonoReferenciaPersonal ?? null,
    parentescoReferenciaPersonal:
      colaborador.parentescoReferenciaPersonal ?? null,
    // Referencias laborales
    nombreReferenciaLaboral: colaborador.nombreReferenciaLaboral ?? null,
    telefonoReferenciaLaboral: colaborador.telefonoReferenciaLaboral ?? null,
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
