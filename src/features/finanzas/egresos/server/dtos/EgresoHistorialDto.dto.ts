export type EgresoHistorialDto = {
  id: string;
  egresoId: string;
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string;
  usuarioId: string | null;
  motivo: string | null;
  fechaCambio: string;
};

