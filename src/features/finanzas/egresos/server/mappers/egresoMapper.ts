import type { EgresoDto } from "../dtos/EgresoDto.dto";
import type { EgresoEntity } from "../repositories/EgresoRepository.repository";

/**
 * Convierte la clasificación del enum de Prisma a formato lowercase con espacios
 */
function mapClasificacion(
  clasificacion: string
):
  | "gasto op"
  | "honorarios"
  | "servicios"
  | "arrendamiento"
  | "comisiones"
  | "disposición" {
  const map: Record<
    string,
    | "gasto op"
    | "honorarios"
    | "servicios"
    | "arrendamiento"
    | "comisiones"
    | "disposición"
  > = {
    GASTO_OP: "gasto op",
    HONORARIOS: "honorarios",
    SERVICIOS: "servicios",
    ARRENDAMIENTO: "arrendamiento",
    COMISIONES: "comisiones",
    DISPOSICION: "disposición",
  };
  return map[clasificacion] || ("gasto op" as const);
}

/**
 * Convierte la categoría del enum de Prisma a formato lowercase con acentos
 */
function mapCategoria(
  categoria: string
): "facturación" | "comisiones" | "disposición" | "bancarizaciones" {
  const map: Record<
    string,
    "facturación" | "comisiones" | "disposición" | "bancarizaciones"
  > = {
    FACTURACION: "facturación",
    COMISIONES: "comisiones",
    DISPOSICION: "disposición",
    BANCARIZACIONES: "bancarizaciones",
  };
  return map[categoria] || ("facturación" as const);
}

/**
 * Convierte un egreso de Prisma a EgresoDto
 * @param entity - Egreso de Prisma con relaciones
 * @returns EgresoDto
 */
export function toEgresoDto(entity: EgresoEntity): EgresoDto {
  return {
    id: entity.id,
    concepto: entity.concepto,
    clasificacion: mapClasificacion(entity.clasificacion),
    categoria: mapCategoria(entity.categoria),
    proveedor: entity.proveedor,
    proveedorId: entity.proveedorId,
    proveedorInfo: entity.proveedorRef
      ? {
          id: entity.proveedorRef.id,
          nombre: entity.proveedorRef.nombre,
          rfc: entity.proveedorRef.rfc,
        }
      : null,
    solicitante: entity.solicitante.toLowerCase() as "rjs" | "rgz" | "calfc",
    autorizador: entity.autorizador.toLowerCase() as "rjs" | "rgz" | "calfc",
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
    cargoAbono: entity.cargoAbono.toLowerCase() as
      | "bdp"
      | "calfc"
      | "global"
      | "rjz"
      | "app",
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
    clienteProyecto: entity.clienteProyecto ?? null,
    clienteProyectoId: entity.clienteProyectoId ?? null,
    clienteProyectoInfo: entity.clienteProyectoRef
      ? {
          id: entity.clienteProyectoRef.id,
          nombre: entity.clienteProyectoRef.nombre,
          rfc: entity.clienteProyectoRef.rfc,
        }
      : null,
    notas: entity.notas,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

/**
 * Convierte un array de egresos de Prisma a EgresoDto[]
 * @param entities - Array de Egreso de Prisma
 * @returns Array de EgresoDto
 */
export function toEgresoDtoArray(entities: EgresoEntity[]): EgresoDto[] {
  return entities.map(toEgresoDto);
}

