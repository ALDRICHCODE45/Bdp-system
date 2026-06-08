import type { MovimientoEntity } from "../../types/Movimiento.type";
import type { MovimientoDto } from "../dtos/MovimientoDto.dto";
import type { MovimientoListItemDto } from "../dtos/MovimientoListDto.dto";

/**
 * Maps a Movimiento entity (with eagerly-loaded relations) to a MovimientoDto.
 * Pure transformation — no async, no DB calls.
 * Converts Decimal to string, Date to ISO string, and maps relation names.
 */
export function toMovimientoDto(entity: MovimientoEntity): MovimientoDto {
  return {
    id: entity.id,
    tipo: entity.tipo,
    titular: entity.titular,
    estadoCuenta: entity.estadoCuenta,
    fechaCorte: entity.fechaCorte.toISOString(),
    fechaOperacion: entity.fechaOperacion.toISOString(),
    descripcionLiteral: entity.descripcionLiteral,
    monto: entity.monto.toString(),
    dedupHash: entity.dedupHash,
    estado: entity.estado,

    concepto: entity.concepto,
    descripcionAdministracion: entity.descripcionAdministracion,
    categoria: entity.categoria,
    formaPago: entity.formaPago,
    cargoAbono: entity.cargoAbono,
    facturadoPor: entity.facturadoPor,
    periodo: entity.periodo,
    numeroFactura: entity.numeroFactura,
    folioFiscal: entity.folioFiscal,

    proveedor: entity.proveedor,
    proveedorId: entity.proveedorId,
    proveedorNombre: entity.proveedorRef?.nombre ?? null,

    cliente: entity.cliente,
    clienteId: entity.clienteId,
    clienteNombre: entity.clienteRef?.nombre ?? null,

    solicitanteId: entity.solicitanteId,
    solicitanteNombre: entity.solicitanteRef?.nombre ?? null,
    autorizadorId: entity.autorizadorId,
    autorizadorNombre: entity.autorizadorRef?.nombre ?? null,

    notas: entity.notas,
    facturaId: entity.facturaId,
    ingresadoPor: entity.ingresadoPor,
    ingresadoPorNombre: entity.ingresadoPorRef?.name ?? null,

    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

/**
 * Maps a Movimiento entity to a list-optimized DTO (omits notas and descripcionAdministracion).
 */
export function toMovimientoListItemDto(
  entity: MovimientoEntity
): MovimientoListItemDto {
  const full = toMovimientoDto(entity);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { notas, descripcionAdministracion, ...listItem } = full;
  return listItem;
}

export function toMovimientoDtoArray(
  entities: MovimientoEntity[]
): MovimientoDto[] {
  return entities.map(toMovimientoDto);
}

export function toMovimientoListItemDtoArray(
  entities: MovimientoEntity[]
): MovimientoListItemDto[] {
  return entities.map(toMovimientoListItemDto);
}
