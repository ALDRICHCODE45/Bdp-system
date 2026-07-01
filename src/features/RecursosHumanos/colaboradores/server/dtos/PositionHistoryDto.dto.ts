/**
 * DTO (server→client boundary) for a `ColaboradorPositionHistory` entry.
 *
 * - `fechaEfectiva` is serialized as an ISO string (Date → string) for
 *   JSON-safety; the mapper is the single source of that conversion (CC7).
 * - `nivel` carries the raw Prisma enum string (e.g. "SENIOR"); the UI is
 *   responsible for picking a friendly label from `NIVEL_LABELS`.
 *
 * No `Decimal` to worry about here — only cargo + enum fields.
 */
export type PositionHistoryDto = {
  id: string;
  colaboradorId: string;
  fechaEfectiva: string;
  cargo: string;
  departamento: string | null;
  nivel: "JUNIOR" | "SEMI_SENIOR" | "SENIOR" | "LEAD" | "GERENCIAL" | null;
  motivo: string | null;
  createdAt: string;
};