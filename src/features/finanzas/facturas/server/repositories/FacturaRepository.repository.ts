import { Factura, ClienteProveedor, User } from "@prisma/client";

export type FacturaEntity = Factura & {
  clienteProveedorRef?: ClienteProveedor | null;
  ingresadoPorRef?: User | null;
};

export type CreateFacturaArgs = {
  tipoOrigen: "INGRESO" | "EGRESO";
  origenId: string;
  clienteProveedorId: string;
  clienteProveedor: string;
  concepto: string;
  monto: number;
  periodo: string;
  numeroFactura: string;
  folioFiscal: string;
  fechaEmision: Date;
  fechaVencimiento: Date;
  estado: "BORRADOR" | "ENVIADA" | "PAGADA" | "CANCELADA";
  formaPago: "TRANSFERENCIA" | "EFECTIVO" | "CHEQUE";
  rfcEmisor: string;
  rfcReceptor: string;
  direccionEmisor: string;
  direccionReceptor: string;
  fechaPago?: Date | null;
  fechaRegistro: Date;
  creadoPor: string;
  autorizadoPor: string;
  notas?: string | null;
  ingresadoPor?: string | null;
};

export type UpdateFacturaArgs = {
  id: string;
  tipoOrigen: "INGRESO" | "EGRESO";
  origenId: string;
  clienteProveedorId: string;
  clienteProveedor: string;
  concepto: string;
  monto: number;
  periodo: string;
  numeroFactura: string;
  folioFiscal: string;
  fechaEmision: Date;
  fechaVencimiento: Date;
  estado: "BORRADOR" | "ENVIADA" | "PAGADA" | "CANCELADA";
  formaPago: "TRANSFERENCIA" | "EFECTIVO" | "CHEQUE";
  rfcEmisor: string;
  rfcReceptor: string;
  direccionEmisor: string;
  direccionReceptor: string;
  fechaPago?: Date | null;
  fechaRegistro: Date;
  creadoPor: string;
  autorizadoPor: string;
  notas?: string | null;
};

export interface FacturaRepository {
  create(data: CreateFacturaArgs): Promise<FacturaEntity>;
  update(data: UpdateFacturaArgs): Promise<FacturaEntity>;
  delete(data: { id: string }): Promise<void>;
  findById(data: { id: string }): Promise<FacturaEntity | null>;
  findByFolioFiscal(folioFiscal: string): Promise<boolean>;
  findByOrigenId(origenId: string): Promise<FacturaEntity[]>;
  getAll(): Promise<FacturaEntity[]>;
}

