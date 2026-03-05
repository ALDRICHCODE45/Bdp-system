import { FacturaEntity } from "../repositories/FacturaRepository.repository";
import { FacturaDto } from "../dtos/FacturaDto.dto";

function mapStatus(value: string): "vigente" | "cancelada" {
  return value.toLowerCase() as "vigente" | "cancelada";
}

export function toFacturaDto(entity: FacturaEntity): FacturaDto {
  return {
    id: entity.id,
    concepto: entity.concepto,
    serie: entity.serie,
    folio: entity.folio,
    fechaEmision: entity.fechaEmision ? entity.fechaEmision.toISOString() : null,
    subtotal: Number(entity.subtotal),
    iva: entity.iva != null ? Number(entity.iva) : null,
    totalImpuestosTransladados: entity.totalImpuestosTransladados != null ? Number(entity.totalImpuestosTransladados) : null,
    totalImpuestosRetenidos: entity.totalImpuestosRetenidos != null ? Number(entity.totalImpuestosRetenidos) : null,
    total: Number(entity.total),
    uuid: entity.uuid,
    rfcEmisor: entity.rfcEmisor,
    nombreReceptor: entity.nombreReceptor,
    rfcReceptor: entity.rfcReceptor,
    metodoPago: entity.metodoPago,
    moneda: entity.moneda,
    usoCfdi: entity.usoCfdi,
    status: mapStatus(entity.status),
    nombreEmisor: entity.nombreEmisor,
    statusPago: entity.statusPago,
    fechaPago: entity.fechaPago ? entity.fechaPago.toISOString() : null,
    facturaUrl: entity.facturaUrl ?? null,
    ingresadoPor: entity.ingresadoPor ?? null,
    ingresadoPorNombre: entity.ingresadoPorRef?.name ?? null,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

export function toFacturaDtoArray(entities: FacturaEntity[]): FacturaDto[] {
  return entities.map(toFacturaDto);
}
