import { Factura, ClienteProveedor, User, Socio } from "@prisma/client";

export type FacturaEntity = Factura & {
  clienteProveedorRef?: Pick<ClienteProveedor, 'id' | 'nombre' | 'rfc' | 'direccion'> | null;
  ingresadoPorRef?: Pick<User, 'name'> | null;
  creadoPorRef?: Pick<Socio, 'nombre'> | null;
  autorizadoPorRef?: Pick<Socio, 'nombre'> | null;
};

export type CreateFacturaArgs = {
  tipoOrigen: "INGRESO" | "EGRESO" | null;
  origenId: string | null;
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
  numeroCuenta: string;
  clabe: string;
  banco: string;
  fechaPago?: Date | null;
  fechaRegistro: Date;
  creadoPor: string;
  creadoPorId: string;
  autorizadoPor: string;
  autorizadoPorId: string;
  notas?: string | null;
  ingresadoPor?: string | null;
};

export type UpdateFacturaArgs = {
  id: string;
  tipoOrigen: "INGRESO" | "EGRESO" | null;
  origenId: string | null;
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
  numeroCuenta: string;
  clabe: string;
  banco: string;
  fechaPago?: Date | null;
  fechaRegistro: Date;
  creadoPor: string;
  creadoPorId: string;
  autorizadoPor: string;
  autorizadoPorId: string;
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
  getPaginated(params: import("@/core/shared/types/pagination.types").PaginationParams): Promise<{ data: FacturaEntity[]; totalCount: number }>;
}

