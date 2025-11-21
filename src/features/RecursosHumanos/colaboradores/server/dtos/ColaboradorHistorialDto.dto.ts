export type ColaboradorHistorialDto = {
  id: string;
  colaboradorId: string;
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string;
  usuarioId: string | null;
  motivo: string | null;
  fechaCambio: string;
};

