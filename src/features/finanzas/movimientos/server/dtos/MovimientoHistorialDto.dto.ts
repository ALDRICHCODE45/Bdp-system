/**
 * DTO for a single MovimientoHistorial entry.
 * All dates serialized as ISO strings. JSON-safe.
 */
export type MovimientoHistorialDto = {
  id: string;
  movimientoId: string;
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string;
  usuarioId: string | null;
  usuarioNombre: string | null;
  motivo: string | null;
  fechaCambio: string;
};
