/**
 * DTO (server→client boundary) for an `AbsenceRecord` row (cap9 req3).
 *
 * Dates are serialized as ISO strings on the way to the client to keep the
 * payload `JSON.stringify`-safe and decoupled from the Prisma `Date` runtime
 * (CC7). The mapper is the single source of truth for this conversion.
 *
 * `dias` is the inclusive count computed by the service
 * (`fechaFin - fechaInicio + 1`, calendar days) — never negative. The client
 * renders this value as-is.
 */
export type AusenciaTipoDto =
  | "VACACIONES"
  | "LICENCIA"
  | "INCAPACIDAD";

export type AbsenceRecordDto = {
  id: string;
  colaboradorId: string;
  tipo: AusenciaTipoDto;
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  motivo: string | null;
  registradoPorId: string | null;
  createdAt: string;
  updatedAt: string;
};