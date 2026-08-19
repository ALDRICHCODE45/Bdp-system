export type TarifaAbogadoAsuntoDto = {
  id: string;
  usuarioId: string;
  usuarioNombre: string;
  usuarioEmail: string;
  asuntoJuridicoId: string;
  asuntoJuridicoNombre: string;
  /** tarifaHora como string (Prisma Decimal → string) para serialización limpia. */
  tarifaHora: string;
  activa: boolean;
  createdById: string;
  createdByNombre: string;
  updatedById: string;
  updatedByNombre: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * DTO liviano que devuelve `getActiveTarifasAction` para alimentar
 * el `useGetActiveTarifas` del sheet de horas. Solo lo que el sheet
 * necesita: el par (usuario, asunto) y el valor de la tarifa.
 */
export type ActiveTarifaDto = {
  id: string;
  usuarioId: string;
  asuntoJuridicoId: string;
  tarifaHora: string;
};
