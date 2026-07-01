import { ResponsabilidadCargo } from "@prisma/client";

/**
 * Args accepted by the repository's `create` operation. The repository layer
 * is the only place where the data shape matches the Prisma model; everything
 * upstream deals with the typed POJO shape (ResponsabilidadCargo-free) so the
 * server→client boundary never leaks Prisma types (CC7).
 */
export type CreateResponsabilidadCargoArgs = {
  colaboradorId: string;
  descripcion: string;
  orden?: number;
  completada?: boolean;
};

/**
 * Args for `update`: only the textual content + completed flag. We do not let
 * the client arbitrarily change `colaboradorId` here — that's a structural
 * move, not a content edit, and the existing edit flow doesn't need it.
 */
export type UpdateResponsabilidadCargoArgs = {
  id: string;
  descripcion: string;
  orden?: number;
  completada?: boolean;
};

/**
 * Args for `toggle`: flip `completada` to the provided value. Encoded as a
 * dedicated method so the toggle control in the UI never has to pass the full
 * edit payload.
 */
export type ToggleResponsabilidadCargoArgs = {
  id: string;
  completada: boolean;
};

export interface ResponsabilidadCargoRepository {
  create(
    data: CreateResponsabilidadCargoArgs
  ): Promise<ResponsabilidadCargo>;
  update(
    data: UpdateResponsabilidadCargoArgs
  ): Promise<ResponsabilidadCargo>;
  toggleCompletada(
    data: ToggleResponsabilidadCargoArgs
  ): Promise<ResponsabilidadCargo>;
  delete(data: { id: string }): Promise<void>;
  findById(data: { id: string }): Promise<ResponsabilidadCargo | null>;
  findByColaboradorId(data: {
    colaboradorId: string;
  }): Promise<ResponsabilidadCargo[]>;
}
