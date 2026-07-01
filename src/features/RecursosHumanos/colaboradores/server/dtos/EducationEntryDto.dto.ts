/**
 * DTO (server→client boundary) for an `EducationEntry` row (cap10 req2).
 *
 * Dates are serialized as ISO strings on the way to the client to keep the
 * payload `JSON.stringify`-safe and decoupled from the Prisma `Date` runtime
 * (CC7). The mapper is the single source of truth for this conversion.
 *
 * `anio` is a plain integer (the year, not a full timestamp) so it crosses
 * the JSON boundary unchanged.
 */
export type EducationEntryDto = {
  id: string;
  colaboradorId: string;
  institucion: string;
  titulo: string;
  anio: number;
  orden: number;
  createdAt: string;
  updatedAt: string;
};