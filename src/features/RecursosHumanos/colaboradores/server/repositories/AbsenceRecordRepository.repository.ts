import type { AbsenceRecord } from "@prisma/client";

/**
 * Args for the repository's `create` operation. The repository layer is the
 * only place where the data shape matches the Prisma model; everything
 * upstream deals with the typed POJO shape (AbsenceRecord-free) so the
 * server→client boundary never leaks Prisma types (CC7).
 */
export type CreateAbsenceRecordArgs = {
  colaboradorId: string;
  tipo: "VACACIONES" | "LICENCIA" | "INCAPACIDAD";
  fechaInicio: Date;
  fechaFin: Date;
  dias: number;
  motivo?: string | null;
  registradoPorId?: string | null;
};

/**
 * Repository contract for the `AbsenceRecord` entity (cap9 req3).
 *
 * Mirrors the structure used by `EmergencyContactRepository`,
 * `ResponsabilidadCargoRepository`, and `EducationEntryRepository`. The
 * Prisma implementation accepts a transaction client (`PrismaTransactionClient`)
 * so a future CC5 boundary can re-use the same repo without spawning a new
 * connection.
 *
 * The service layer is responsible for the inclusive `dias` math (P6 spec
 * cap9 req3) and the `fechaFin >= fechaInicio` validation — the repo is a
 * pure persistence adapter.
 */
export interface AbsenceRecordRepository {
  create(data: CreateAbsenceRecordArgs): Promise<AbsenceRecord>;
  findByColaboradorId(data: {
    colaboradorId: string;
  }): Promise<AbsenceRecord[]>;
}