import type { ClienteProveedorDto } from "../dtos/ClienteProveedorDto.dto";
import type { ClienteProveedorEntity } from "../repositories/ClienteProveedorRepository.repository";

/**
 * Convierte un cliente/proveedor de Prisma a ClienteProveedorDto
 * @param entity - ClienteProveedor de Prisma con relación socio
 * @returns ClienteProveedorDto
 */
export function toClienteProveedorDto(
  entity: ClienteProveedorEntity
): ClienteProveedorDto {
  return {
    id: entity.id,
    nombre: entity.nombre,
    rfc: entity.rfc,
    tipo: entity.tipo.toLowerCase() as "cliente" | "proveedor",
    direccion: entity.direccion,
    telefono: entity.telefono,
    email: entity.email,
    contacto: entity.contacto,
    numeroCuenta: entity.numeroCuenta,
    clabe: entity.clabe,
    banco: entity.banco,
    activo: entity.activo,
    fechaRegistro: entity.fechaRegistro.toISOString(),
    notas: entity.notas,
    socioResponsable: entity.socio
      ? {
          id: entity.socio.id,
          nombre: entity.socio.nombre,
        }
      : null,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

/**
 * Convierte un array de clientes/proveedores de Prisma a ClienteProveedorDto[]
 * @param entities - Array de ClienteProveedor de Prisma
 * @returns Array de ClienteProveedorDto
 */
export function toClienteProveedorDtoArray(
  entities: ClienteProveedorEntity[]
): ClienteProveedorDto[] {
  return entities.map(toClienteProveedorDto);
}

