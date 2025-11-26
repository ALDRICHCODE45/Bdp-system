import { Egreso, ClienteProveedor, User, Socio } from "@prisma/client";

export type EgresoEntity = Egreso & {
  proveedorRef?: ClienteProveedor | null;
  clienteProyectoRef?: ClienteProveedor | null;
  ingresadoPorRef?: User | null;
  solicitanteRef?: Socio | null;
  autorizadorRef?: Socio | null;
};

export type CreateEgresoArgs = {
  concepto: string;
  clasificacion:
    | "GASTO_OP"
    | "HONORARIOS"
    | "SERVICIOS"
    | "ARRENDAMIENTO"
    | "COMISIONES"
    | "DISPOSICION";
  categoria: "FACTURACION" | "COMISIONES" | "DISPOSICION" | "BANCARIZACIONES";
  proveedor: string;
  proveedorId: string;
  solicitante: string;
  solicitanteId: string;
  autorizador: string;
  autorizadorId: string;
  numeroFactura: string;
  folioFiscal: string;
  periodo: string;
  formaPago: "TRANSFERENCIA" | "EFECTIVO" | "CHEQUE";
  origen: string;
  numeroCuenta: string;
  clabe: string;
  cargoAbono: "BDP" | "CALFC" | "GLOBAL" | "RJZ" | "APP";
  cantidad: number;
  estado: "PAGADO" | "PENDIENTE" | "CANCELADO";
  fechaPago?: Date | null;
  fechaRegistro: Date;
  facturadoPor: "BDP" | "CALFC" | "GLOBAL" | "RGZ" | "RJS" | "APP";
  clienteProyecto: string | null;
  clienteProyectoId: string | null;
  notas?: string | null;
  ingresadoPor?: string | null;
};

export type UpdateEgresoArgs = {
  id: string;
  concepto: string;
  clasificacion:
    | "GASTO_OP"
    | "HONORARIOS"
    | "SERVICIOS"
    | "ARRENDAMIENTO"
    | "COMISIONES"
    | "DISPOSICION";
  categoria: "FACTURACION" | "COMISIONES" | "DISPOSICION" | "BANCARIZACIONES";
  proveedor: string;
  proveedorId: string;
  solicitante: string;
  solicitanteId: string;
  autorizador: string;
  autorizadorId: string;
  numeroFactura: string;
  folioFiscal: string;
  periodo: string;
  formaPago: "TRANSFERENCIA" | "EFECTIVO" | "CHEQUE";
  origen: string;
  numeroCuenta: string;
  clabe: string;
  cargoAbono: "BDP" | "CALFC" | "GLOBAL" | "RJZ" | "APP";
  cantidad: number;
  estado: "PAGADO" | "PENDIENTE" | "CANCELADO";
  fechaPago?: Date | null;
  fechaRegistro: Date;
  facturadoPor: "BDP" | "CALFC" | "GLOBAL" | "RGZ" | "RJS" | "APP";
  clienteProyecto: string | null;
  clienteProyectoId: string | null;
  notas?: string | null;
};

export interface EgresoRepository {
  create(data: CreateEgresoArgs): Promise<EgresoEntity>;
  update(data: UpdateEgresoArgs): Promise<EgresoEntity>;
  delete(data: { id: string }): Promise<void>;
  findById(data: { id: string }): Promise<EgresoEntity | null>;
  findByFolioFiscal(folioFiscal: string): Promise<boolean>;
  getAll(): Promise<EgresoEntity[]>;
}

