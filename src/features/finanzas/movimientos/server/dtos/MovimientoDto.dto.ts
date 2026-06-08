/**
 * Full single-record DTO for a Movimiento.
 * All dates serialized as ISO strings. Decimal monto as string.
 * JSON-safe across server/client boundary.
 */
export type MovimientoDto = {
  id: string;
  tipo: string;
  titular: string;
  estadoCuenta: string;
  fechaCorte: string;
  fechaOperacion: string;
  descripcionLiteral: string;
  monto: string;
  dedupHash: string;
  estado: string;

  // Optional fields
  concepto: string | null;
  descripcionAdministracion: string | null;
  categoria: string | null;
  formaPago: string | null;
  cargoAbono: string | null;
  facturadoPor: string | null;
  periodo: string | null;
  numeroFactura: string | null;
  folioFiscal: string | null;

  // Proveedor
  proveedor: string | null;
  proveedorId: string | null;
  proveedorNombre: string | null;

  // Cliente
  cliente: string | null;
  clienteId: string | null;
  clienteNombre: string | null;

  // People
  solicitanteId: string | null;
  solicitanteNombre: string | null;
  autorizadorId: string | null;
  autorizadorNombre: string | null;

  // Other
  notas: string | null;
  facturaId: string | null;
  ingresadoPor: string | null;
  ingresadoPorNombre: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;
};
