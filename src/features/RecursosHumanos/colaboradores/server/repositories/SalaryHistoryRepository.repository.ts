import { ColaboradorSalaryHistory } from "@prisma/client";

/**
 * Args for the repository's `create` operation. The service layer is the only
 * place that calls this — typically inside a `$transaction` block alongside a
 * `Colaborador.update` write (CC5 transactional integrity for comp history).
 */
export type CreateSalaryHistoryArgs = {
  colaboradorId: string;
  fechaEfectiva: Date;
  monto: number;
  moneda?: string;
  motivo?: string | null;
};

/**
 * Repository contract for the `ColaboradorSalaryHistory` entity.
 *
 * The Prisma implementation accepts a transaction client
 * (`PrismaTransactionClient`) so service-level `$transaction` writes re-use the
 * same repo without spawning a new connection.
 *
 * The cap6 spec keeps salary/position history as AUDIT-ONLY tables: there is
 * no `update` or `delete` method here on purpose. Mutations only ever append
 * a new row (cap6 req6 — "history NOT user-deletable").
 */
export interface SalaryHistoryRepository {
  create(data: CreateSalaryHistoryArgs): Promise<ColaboradorSalaryHistory>;
  findById(data: { id: string }): Promise<ColaboradorSalaryHistory | null>;
  /**
   * List salary history for one colaborador ordered by `fechaEfectiva` desc
   * (most-recent-first, per spec cap6 req2). The cap6 timeline UI relies on
   * this order so callers MUST NOT pre-sort.
   */
  findByColaboradorId(data: {
    colaboradorId: string;
  }): Promise<ColaboradorSalaryHistory[]>;
}