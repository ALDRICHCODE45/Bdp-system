export type FacturaHistorialDto = {
  id: string;
  facturaId: string;
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string;
  usuarioId: string | null;
  motivo: string | null;
  fechaCambio: string; // Represented as string for DTO
};

