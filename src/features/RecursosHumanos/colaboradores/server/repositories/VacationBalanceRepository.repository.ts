import type { VacationBalance } from "@prisma/client";

/**
 * Args for the repository's `upsert` operation. The 1:1 @unique constraint on
 * `colaboradorId` (P0 schema) means a manual-set action MUST use upsert
 * semantics — a plain `create` would collide on the second call. The repo
 * hands the atomic `upsert` to Prisma so a race between two concurrent
 * manual-set calls is handled by Postgres `ON CONFLICT` (Design Risk P6).
 */
export type UpsertVacationBalanceArgs = {
  colaboradorId: string;
  diasDisponibles: number;
  diasTomados: number;
};

/**
 * Repository contract for the `VacationBalance` entity (cap9 req1).
 *
 * The entity is 1:1 with `Colaborador` (P0 schema) — there is no list/find
 * surface because the collaborator is the lookup key. Reads happen via
 * `findByColaboradorId` (nullable when no balance has been registered yet);
 * writes happen via `upsert` so the 1:1 invariant is preserved even under
 * concurrency.
 */
export interface VacationBalanceRepository {
  upsert(data: UpsertVacationBalanceArgs): Promise<VacationBalance>;
  findByColaboradorId(data: {
    colaboradorId: string;
  }): Promise<VacationBalance | null>;
}