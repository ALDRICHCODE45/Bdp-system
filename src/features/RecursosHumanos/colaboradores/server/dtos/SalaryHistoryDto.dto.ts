/**
 * DTO (server→client boundary) for a `ColaboradorSalaryHistory` entry.
 *
 * - `monto` is serialized as a string (Prisma `Decimal` → string) so the
 *   payload is `JSON.stringify`-safe and the client can format it with
 *   `Intl.NumberFormat` without re-parsing a `Decimal` instance.
 * - `fechaEfectiva` is serialized as an ISO string (Date → string) for the
 *   same JSON safety reason.
 *
 * The mapper is the single source of truth for these conversions (CC7).
 */
export type SalaryHistoryDto = {
  id: string;
  colaboradorId: string;
  fechaEfectiva: string;
  monto: string;
  moneda: string;
  motivo: string | null;
  createdAt: string;
};