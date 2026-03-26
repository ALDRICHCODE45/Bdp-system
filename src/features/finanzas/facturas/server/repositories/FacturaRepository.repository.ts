import { Factura, User } from "@prisma/client";
import { FacturasFilterParams } from "../../types/FacturasFilterParams";

export type FacturaEntity = Factura & {
  ingresadoPorRef?: Pick<User, 'name'> | null;
};

export type CreateFacturaArgs = {
  concepto: string;
  serie?: string | null;
  folio?: string | null;
  fechaEmision?: Date | null;
  subtotal: number;
  iva?: number | null;
  totalImpuestosTransladados?: number | null;
  totalImpuestosRetenidos?: number | null;
  total: number;
  uuid: string;
  rfcEmisor: string;
  nombreReceptor?: string | null;
  rfcReceptor: string;
  metodoPago?: string | null;
  medioPago?: string | null;
  moneda?: string;
  usoCfdi?: string | null;
  status: "VIGENTE" | "CANCELADA";
  nombreEmisor?: string | null;
  statusPago?: string | null;
  fechaPago?: Date | null;
  facturaUrl?: string | null;
  ingresadoPor?: string | null;
};

export type UpdateFacturaArgs = {
  id: string;
  concepto: string;
  serie?: string | null;
  folio?: string | null;
  fechaEmision?: Date | null;
  subtotal: number;
  iva?: number | null;
  totalImpuestosTransladados?: number | null;
  totalImpuestosRetenidos?: number | null;
  total: number;
  uuid: string;
  rfcEmisor: string;
  nombreReceptor?: string | null;
  rfcReceptor: string;
  metodoPago?: string | null;
  medioPago?: string | null;
  moneda?: string;
  usoCfdi?: string | null;
  status: "VIGENTE" | "CANCELADA";
  nombreEmisor?: string | null;
  statusPago?: string | null;
  fechaPago?: Date | null;
  facturaUrl?: string | null;
};

/** Fila de agregados numéricos agrupados por moneda */
export type FacturaAggregateRow = {
  moneda: string;
  count: number;
  total: number;
  subtotal: number;
  totalImpuestosTransladados: number | null;
  totalImpuestosRetenidos: number | null;
};

export interface FacturaRepository {
  create(data: CreateFacturaArgs): Promise<FacturaEntity>;
  update(data: UpdateFacturaArgs): Promise<FacturaEntity>;
  delete(data: { id: string }): Promise<void>;
  findById(data: { id: string }): Promise<FacturaEntity | null>;
  findByUuid(uuid: string): Promise<boolean>;
  getAll(): Promise<FacturaEntity[]>;
  getPaginated(params: FacturasFilterParams): Promise<{ data: FacturaEntity[]; totalCount: number }>;
  getAggregates(
    params: Omit<FacturasFilterParams, "page" | "pageSize" | "sortBy" | "sortOrder">
  ): Promise<FacturaAggregateRow[]>;
}
