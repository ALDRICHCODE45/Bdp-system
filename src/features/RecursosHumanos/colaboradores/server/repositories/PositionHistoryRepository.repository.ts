import {
  ColaboradorPositionHistory,
  NivelSeniority,
} from "@prisma/client";

/**
 * Args for the repository's `create` operation. The service layer is the only
 * place that calls this — typically inside a `$transaction` block alongside a
 * `Colaborador.update` write (CC5 transactional integrity).
 */
export type CreatePositionHistoryArgs = {
  colaboradorId: string;
  fechaEfectiva: Date;
  cargo: string;
  departamento?: string | null;
  nivel?: NivelSeniority | null;
  motivo?: string | null;
};

/**
 * Repository contract for the `ColaboradorPositionHistory` entity.
 *
 * Audit-only by design: NO `update` or `delete` methods here (cap6 req6 —
 * history is NOT user-deletable). The cap5/cap6 spec keeps position history
 * as a write-only-append ledger.
 */
export interface PositionHistoryRepository {
  create(data: CreatePositionHistoryArgs): Promise<ColaboradorPositionHistory>;
  findById(data: { id: string }): Promise<ColaboradorPositionHistory | null>;
  /**
   * List position history for one colaborador ordered by `fechaEfectiva` desc
   * (most-recent-first, per spec cap6 req3). The cap6 timeline UI relies on
   * this order.
   */
  findByColaboradorId(data: {
    colaboradorId: string;
  }): Promise<ColaboradorPositionHistory[]>;
}