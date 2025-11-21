export type CreateFacturaHistorialDto = {
  facturaId: string;
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string;
  usuarioId?: string | null;
  motivo?: string | null;
};

