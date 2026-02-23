import { Factura, User } from "@prisma/client";
import { FacturasFilterParams } from "../../types/FacturasFilterParams";

export type FacturaEntity = Factura & {
  ingresadoPorRef?: Pick<User, 'name'> | null;
};

export type CreateFacturaArgs = {
  concepto: string;
  serie?: string | null;
  folio?: string | null;
  subtotal: number;
  totalImpuestosTransladados?: number | null;
  totalImpuestosRetenidos?: number | null;
  total: number;
  uuid: string;
  rfcEmisor: string;
  nombreReceptor?: string | null;
  rfcReceptor: string;
  metodoPago?: string | null;
  moneda?: string;
  usoCfdi?: string | null;
  status: "BORRADOR" | "ENVIADA" | "PAGADA" | "CANCELADA";
  nombreEmisor?: string | null;
  statusPago?: string | null;
  fechaPago?: Date | null;
  ingresadoPor?: string | null;
};

export type UpdateFacturaArgs = {
  id: string;
  concepto: string;
  serie?: string | null;
  folio?: string | null;
  subtotal: number;
  totalImpuestosTransladados?: number | null;
  totalImpuestosRetenidos?: number | null;
  total: number;
  uuid: string;
  rfcEmisor: string;
  nombreReceptor?: string | null;
  rfcReceptor: string;
  metodoPago?: string | null;
  moneda?: string;
  usoCfdi?: string | null;
  status: "BORRADOR" | "ENVIADA" | "PAGADA" | "CANCELADA";
  nombreEmisor?: string | null;
  statusPago?: string | null;
  fechaPago?: Date | null;
};

export interface FacturaRepository {
  create(data: CreateFacturaArgs): Promise<FacturaEntity>;
  update(data: UpdateFacturaArgs): Promise<FacturaEntity>;
  delete(data: { id: string }): Promise<void>;
  findById(data: { id: string }): Promise<FacturaEntity | null>;
  findByUuid(uuid: string): Promise<boolean>;
  getAll(): Promise<FacturaEntity[]>;
  getPaginated(params: FacturasFilterParams): Promise<{ data: FacturaEntity[]; totalCount: number }>;
}
