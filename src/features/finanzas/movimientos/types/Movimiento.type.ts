import type {
  Movimiento,
  MovimientoTipo,
  MovimientoCategoria,
  MovimientoFormaPago,
  MovimientoCargoAbono,
  MovimientoEstado,
  MovimientoFacturadoPor,
  MovimientoHistorial,
  ClienteProveedor,
  Socio,
  User,
} from "@prisma/client";

// Re-export enums for convenience
export type {
  MovimientoTipo,
  MovimientoCategoria,
  MovimientoFormaPago,
  MovimientoCargoAbono,
  MovimientoEstado,
  MovimientoFacturadoPor,
};

/**
 * Domain entity type extending the Prisma-generated Movimiento.
 * Includes optional eagerly-loaded relations.
 */
export type MovimientoEntity = Movimiento & {
  proveedorRef?: ClienteProveedor | null;
  clienteRef?: ClienteProveedor | null;
  solicitanteRef?: Socio | null;
  autorizadorRef?: Socio | null;
  ingresadoPorRef?: User | null;
  historial?: MovimientoHistorial[];
};
