import type { EducationEntry } from "@prisma/client";

/**
 * Args for the repository's `create` operation. The repository layer is the
 * only place where the data shape matches the Prisma model; everything
 * upstream deals with the typed POJO shape (EducationEntry-free) so the
 * server→client boundary never leaks Prisma types (CC7).
 */
export type CreateEducationEntryArgs = {
  colaboradorId: string;
  institucion: string;
  titulo: string;
  anio: number;
  orden?: number;
};

/**
 * Args for the repository's `update` operation. The `id` identifies the row
 * to patch; everything else is the new value (overwriting the previous).
 */
export type UpdateEducationEntryArgs = {
  id: string;
  institucion: string;
  titulo: string;
  anio: number;
  orden?: number;
};

/**
 * Repository contract for the `EducationEntry` entity (cap10 req2/3).
 *
 * Mirrors the structure used by `EmergencyContactRepository` and
 * `ResponsabilidadCargoRepository`. The Prisma implementation accepts a
 * transaction client (`PrismaTransactionClient`) so a future CC5 boundary
 * can re-use the same repo without spawning a new connection.
 *
 * NOTE: bulk `replaceOrden` lives on the service layer (it needs
 * `prisma.$transaction` which the transaction-client type does NOT expose).
 * See `EducationEntryService.reorder`.
 */
export interface EducationEntryRepository {
  create(data: CreateEducationEntryArgs): Promise<EducationEntry>;
  update(data: UpdateEducationEntryArgs): Promise<EducationEntry>;
  delete(data: { id: string }): Promise<void>;
  findById(data: { id: string }): Promise<EducationEntry | null>;
  findByColaboradorId(data: {
    colaboradorId: string;
  }): Promise<EducationEntry[]>;
}