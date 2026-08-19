export type TarifaAbogadoAsuntoHistorialDto = {
  id: string;
  tarifaId: string;
  /** null en creación inicial. */
  tarifaHoraAnterior: string | null;
  tarifaHoraNueva: string;
  changedById: string;
  changedByNombre: string;
  motivo: string | null;
  changedAt: string;
};
