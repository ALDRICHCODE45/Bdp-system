import type { IngresoDto } from "../dtos/IngresoDto.dto";
import type { IngresoEntity } from "../repositories/IngresoRepository.repository";

/**
 * Convierte un ingreso de Prisma a IngresoDto
 * @param entity - Ingreso de Prisma con relaciones
 * @returns IngresoDto
 */
export function toIngresoDto(entity: IngresoEntity): IngresoDto {
  return {
    id: entity.id,
    concepto: entity.concepto,
    cliente: entity.cliente,
    clienteId: entity.clienteId,
    clienteInfo: entity.clienteRef
      ? {
          id: entity.clienteRef.id,
          nombre: entity.clienteRef.nombre,
          rfc: entity.clienteRef.rfc,
        }
      : null,
    solicitanteId: entity.solicitanteId,
    solicitanteNombre: entity.solicitanteRef?.nombre ?? null,
    autorizadorId: entity.autorizadorId,
    autorizadorNombre: entity.autorizadorRef?.nombre ?? null,
    numeroFactura: entity.numeroFactura,
    folioFiscal: entity.folioFiscal,
    periodo: entity.periodo,
    formaPago: entity.formaPago.toLowerCase() as
      | "transferencia"
      | "efectivo"
      | "cheque",
    origen: entity.origen,
    numeroCuenta: entity.numeroCuenta,
    clabe: entity.clabe,
    cargoAbono: entity.cargoAbono.toLowerCase() as "bdp" | "calfc",
    cantidad: Number(entity.cantidad),
    estado: entity.estado.toLowerCase() as "pagado" | "pendiente" | "cancelado",
    fechaPago: entity.fechaPago ? entity.fechaPago.toISOString() : null,
    fechaRegistro: entity.fechaRegistro.toISOString(),
    facturadoPor: entity.facturadoPor.toLowerCase() as
      | "bdp"
      | "calfc"
      | "global"
      | "rgz"
      | "rjs"
      | "app",
    clienteProyecto: entity.clienteProyecto,
    fechaParticipacion: entity.fechaParticipacion
      ? entity.fechaParticipacion.toISOString()
      : null,
    notas: entity.notas,
    ingresadoPor: entity.ingresadoPor ?? null,
    ingresadoPorNombre: entity.ingresadoPorRef?.name ?? null,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

/**
 * Convierte un array de ingresos de Prisma a IngresoDto[]
 * @param entities - Array de Ingreso de Prisma
 * @returns Array de IngresoDto
 */
export function toIngresoDtoArray(entities: IngresoEntity[]): IngresoDto[] {
  return entities.map(toIngresoDto);
}

