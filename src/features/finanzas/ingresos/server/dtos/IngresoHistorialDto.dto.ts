export type IngresoHistorialDto = {
  id: string;
  ingresoId: string;
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string;
  usuarioId: string | null;
  motivo: string | null;
  fechaCambio: string;
};

