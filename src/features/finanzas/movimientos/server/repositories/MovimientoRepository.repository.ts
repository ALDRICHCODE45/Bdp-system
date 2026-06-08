import type { Decimal } from "@prisma/client/runtime/library";
import type {
  MovimientoTipo,
  MovimientoCategoria,
  MovimientoFormaPago,
  MovimientoCargoAbono,
  MovimientoEstado,
  MovimientoFacturadoPor,
} from "../../types/Movimiento.type";
import type { MovimientoEntity } from "../../types/Movimiento.type";

// ---------------------------------------------------------------------------
// Filter params
// ---------------------------------------------------------------------------

export type MovimientoFilterParams = {
  page?: number;
  size?: number;
  tipo?: MovimientoTipo | "ALL";
  search?: string;
  estado?: MovimientoEstado[];
  categoria?: MovimientoCategoria[];
  titular?: string[];
  formaPago?: MovimientoFormaPago[];
  cargoAbono?: MovimientoCargoAbono[];
  facturadoPor?: MovimientoFacturadoPor[];
  proveedorId?: string[];
  clienteId?: string[];
  solicitanteId?: string[];
  autorizadorId?: string[];
  fechaOperacionFrom?: Date;
  fechaOperacionTo?: Date;
  fechaCorteFrom?: Date;
  fechaCorteTo?: Date;
  montoMin?: number;
  montoMax?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

// ---------------------------------------------------------------------------
// Create / Update args
// ---------------------------------------------------------------------------

export type CreateMovimientoArgs = {
  tipo: MovimientoTipo;
  titular: string;
  estadoCuenta: string;
  fechaCorte: Date;
  fechaOperacion: Date;
  descripcionLiteral: string;
  monto: number;
  dedupHash: string;
  ingresadoPor: string | null;

  // Optional fields
  concepto?: string | null;
  descripcionAdministracion?: string | null;
  categoria?: MovimientoCategoria | null;
  formaPago?: MovimientoFormaPago | null;
  cargoAbono?: MovimientoCargoAbono | null;
  facturadoPor?: MovimientoFacturadoPor | null;
  periodo?: string | null;
  numeroFactura?: string | null;
  folioFiscal?: string | null;
  proveedor?: string | null;
  proveedorId?: string | null;
  cliente?: string | null;
  clienteId?: string | null;
  solicitanteId?: string | null;
  autorizadorId?: string | null;
  notas?: string | null;
  facturaId?: string | null;
  estado?: MovimientoEstado;
};

export type UpdateMovimientoArgs = Partial<
  Omit<CreateMovimientoArgs, "dedupHash" | "ingresadoPor">
> & {
  id: string;
};

// ---------------------------------------------------------------------------
// Aggregates
// ---------------------------------------------------------------------------

export type MovimientoAggregates = {
  totalIngresos: Decimal;
  totalEgresos: Decimal;
  countIngresos: number;
  countEgresos: number;
};

// ---------------------------------------------------------------------------
// findAll result
// ---------------------------------------------------------------------------

export type FindAllMovimientosResult = {
  items: MovimientoEntity[];
  total: number;
  aggregates: MovimientoAggregates;
};

// ---------------------------------------------------------------------------
// Repository interface
// ---------------------------------------------------------------------------

export interface MovimientoRepository {
  findAll(params: MovimientoFilterParams): Promise<FindAllMovimientosResult>;

  findById(id: string): Promise<MovimientoEntity | null>;

  findByDedupHash(dedupHash: string): Promise<MovimientoEntity | null>;

  findDedupHashesIn(hashes: string[]): Promise<string[]>;

  getDistinctTitulares(): Promise<string[]>;

  create(args: CreateMovimientoArgs): Promise<MovimientoEntity>;

  createMany(args: CreateMovimientoArgs[]): Promise<number>;

  update(args: UpdateMovimientoArgs): Promise<MovimientoEntity>;

  delete(id: string): Promise<void>;
}
