/**
 * DTO (server→client boundary) for a `VacationBalance` row (cap9 req1).
 *
 * The VacationBalance entity is 1:1 with Colaborador (P0 schema); the DTO
 * is intentionally minimal — the donut chart in `AusenciasTab` only needs
 * `diasDisponibles` and `diasTomados`. The mapper is the single source of
 * truth for any conversion from the Prisma row.
 */
export type VacationBalanceDto = {
  id: string;
  colaboradorId: string;
  diasDisponibles: number;
  diasTomados: number;
  createdAt: string;
  updatedAt: string;
};