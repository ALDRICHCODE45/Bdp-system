import { EmergencyContact } from "@prisma/client";

/**
 * Args accepted by the repository's `create` operation. The repository layer is
 * the only place where the data shape matches the Prisma model; everything
 * upstream deals with the typed POJO shape (`EmergencyContact`-free) so the
 * server→client boundary never leaks Prisma types (CC7).
 */
export type CreateEmergencyContactArgs = {
  colaboradorId: string;
  nombre: string;
  parentesco: string;
  telefono: string;
  email?: string | null;
  notas?: string | null;
};

/**
 * Args accepted by the repository's `update` operation. The `id` identifies the
 * row to patch; everything else is the new value (overwriting the previous).
 */
export type UpdateEmergencyContactArgs = {
  id: string;
  nombre: string;
  parentesco: string;
  telefono: string;
  email?: string | null;
  notas?: string | null;
};

/**
 * Repository contract for the EmergencyContact entity.
 *
 * Mirrors the structure used by `EmpresaRepository`,
 * `PermissionRepository`, and other small-domain features in this codebase.
 * The Prisma implementation accepts a transaction client (`PrismaTransactionClient`)
 * so service-level `$transaction` writes can re-use the same repo without
 * spawning a new connection (CC5-ish — atomic write ahead of the upcoming
 * CC5 boundary for PositionHistory).
 */
export interface EmergencyContactRepository {
  create(data: CreateEmergencyContactArgs): Promise<EmergencyContact>;
  update(data: UpdateEmergencyContactArgs): Promise<EmergencyContact>;
  delete(data: { id: string }): Promise<void>;
  findById(data: { id: string }): Promise<EmergencyContact | null>;
  findByColaboradorId(data: {
    colaboradorId: string;
  }): Promise<EmergencyContact[]>;
}
