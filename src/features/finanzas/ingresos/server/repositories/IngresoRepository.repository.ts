import { Ingreso, ClienteProveedor, User } from "@prisma/client";

export type IngresoEntity = Ingreso & {
  clienteRef?: ClienteProveedor | null;
  ingresadoPorRef?: User | null;
};

export type CreateIngresoArgs = {
  concepto: string;
  cliente: string;
  clienteId: string;
  solicitante: "RJS" | "RGZ" | "CALFC";
  autorizador: "RJS" | "RGZ" | "CALFC";
  numeroFactura: string;
  folioFiscal: string;
  periodo: string;
  formaPago: "TRANSFERENCIA" | "EFECTIVO" | "CHEQUE";
  origen: string;
  numeroCuenta: string;
  clabe: string;
  cargoAbono: "BDP" | "CALFC";
  cantidad: number;
  estado: "PAGADO" | "PENDIENTE" | "CANCELADO";
  fechaPago?: Date | null;
  fechaRegistro: Date;
  facturadoPor: "BDP" | "CALFC" | "GLOBAL" | "RGZ" | "RJS" | "APP";
  clienteProyecto: string;
  fechaParticipacion?: Date | null;
  facturaId?: string | null;
  notas?: string | null;
  ingresadoPor?: string | null;
};

export type UpdateIngresoArgs = {
  id: string;
  concepto: string;
  cliente: string;
  clienteId: string;
  solicitante: "RJS" | "RGZ" | "CALFC";
  autorizador: "RJS" | "RGZ" | "CALFC";
  numeroFactura: string;
  folioFiscal: string;
  periodo: string;
  formaPago: "TRANSFERENCIA" | "EFECTIVO" | "CHEQUE";
  origen: string;
  numeroCuenta: string;
  clabe: string;
  cargoAbono: "BDP" | "CALFC";
  cantidad: number;
  estado: "PAGADO" | "PENDIENTE" | "CANCELADO";
  fechaPago?: Date | null;
  fechaRegistro: Date;
  facturadoPor: "BDP" | "CALFC" | "GLOBAL" | "RGZ" | "RJS" | "APP";
  clienteProyecto: string;
  fechaParticipacion?: Date | null;
  facturaId?: string | null;
  notas?: string | null;
};

export interface IngresoRepository {
  create(data: CreateIngresoArgs): Promise<IngresoEntity>;
  update(data: UpdateIngresoArgs): Promise<IngresoEntity>;
  delete(data: { id: string }): Promise<void>;
  findById(data: { id: string }): Promise<IngresoEntity | null>;
  findByFolioFiscal(folioFiscal: string): Promise<boolean>;
  getAll(): Promise<IngresoEntity[]>;
}

