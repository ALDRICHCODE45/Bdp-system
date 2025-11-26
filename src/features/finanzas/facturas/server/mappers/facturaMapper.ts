import { FacturaEntity } from "../repositories/FacturaRepository.repository";
import { FacturaDto } from "../dtos/FacturaDto.dto";

function mapTipoOrigen(value: string): "ingreso" | "egreso" {
  return value.toLowerCase() as "ingreso" | "egreso";
}

function mapEstado(
  value: string
): "borrador" | "enviada" | "pagada" | "cancelada" {
  return value.toLowerCase() as "borrador" | "enviada" | "pagada" | "cancelada";
}

function mapFormaPago(
  value: string
): "transferencia" | "efectivo" | "cheque" {
  return value.toLowerCase() as "transferencia" | "efectivo" | "cheque";
}

export function toFacturaDto(entity: FacturaEntity): FacturaDto {
  return {
    id: entity.id,
    tipoOrigen: mapTipoOrigen(entity.tipoOrigen),
    origenId: entity.origenId,
    clienteProveedorId: entity.clienteProveedorId,
    clienteProveedorInfo: entity.clienteProveedorRef
      ? {
          id: entity.clienteProveedorRef.id,
          nombre: entity.clienteProveedorRef.nombre,
          rfc: entity.clienteProveedorRef.rfc,
          direccion: entity.clienteProveedorRef.direccion,
        }
      : null,
    clienteProveedor: entity.clienteProveedor,
    concepto: entity.concepto,
    monto: Number(entity.monto),
    periodo: entity.periodo,
    numeroFactura: entity.numeroFactura,
    folioFiscal: entity.folioFiscal,
    fechaEmision: entity.fechaEmision.toISOString(),
    fechaVencimiento: entity.fechaVencimiento.toISOString(),
    estado: mapEstado(entity.estado),
    formaPago: mapFormaPago(entity.formaPago),
    rfcEmisor: entity.rfcEmisor,
    rfcReceptor: entity.rfcReceptor,
    direccionEmisor: entity.direccionEmisor,
    direccionReceptor: entity.direccionReceptor,
    numeroCuenta: entity.numeroCuenta,
    clabe: entity.clabe,
    banco: entity.banco,
    fechaPago: entity.fechaPago ? entity.fechaPago.toISOString() : null,
    fechaRegistro: entity.fechaRegistro.toISOString(),
    creadoPorId: entity.creadoPorId,
    creadoPorNombre: entity.creadoPorRef?.nombre ?? null,
    autorizadoPorId: entity.autorizadoPorId,
    autorizadoPorNombre: entity.autorizadoPorRef?.nombre ?? null,
    notas: entity.notas,
    ingresadoPor: entity.ingresadoPor ?? null,
    ingresadoPorNombre: entity.ingresadoPorRef?.name ?? null,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

export function toFacturaDtoArray(entities: FacturaEntity[]): FacturaDto[] {
  return entities.map(toFacturaDto);
}

