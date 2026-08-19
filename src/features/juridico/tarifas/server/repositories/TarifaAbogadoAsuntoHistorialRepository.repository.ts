import type {
  TarifaAbogadoAsuntoHistorial,
  User,
} from "@prisma/client";
import type { Prisma } from "@prisma/client";

/**
 * Entity del historial de cambios de tarifa. Una sola fila = un cambio
 * (creación o edición). Append-only a nivel repo: solo se exponen
 * `create` y `findByTarifaId` — NUNCA `update` ni `delete`.
 */
export type TarifaAbogadoAsuntoHistorialEntity =
  TarifaAbogadoAsuntoHistorial & {
    changedBy: Pick<User, "id" | "name">;
  };

export type CreateTarifaAbogadoAsuntoHistorialArgs = {
  tarifaId: string;
  tarifaHoraAnterior: Prisma.Decimal | number | null;
  tarifaHoraNueva: Prisma.Decimal | number;
  changedById: string;
  motivo?: string | null;
};

export interface TarifaAbogadoAsuntoHistorialRepository {
  /**
   * Append-only. Inserta una nueva fila. La unicidad de "append-only" se
   * sostiene en el contrato del repo: NO se exponen `update` ni `delete`.
   */
  create(
    data: CreateTarifaAbogadoAsuntoHistorialArgs
  ): Promise<TarifaAbogadoAsuntoHistorialEntity>;
  /**
   * Devuelve el historial de una tarifa, newest-first (cambios más recientes
   * primero), con el nombre del autor de cada cambio.
   */
  findByTarifaId(
    tarifaId: string
  ): Promise<TarifaAbogadoAsuntoHistorialEntity[]>;
}
