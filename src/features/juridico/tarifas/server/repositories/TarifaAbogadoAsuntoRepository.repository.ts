import type {
  TarifaAbogadoAsunto,
  User,
  AsuntoJuridico,
} from "@prisma/client";
import type { Prisma } from "@prisma/client";

/**
 * Entity = fila Prisma de `TarifaAbogadoAsunto` con las relaciones
 * mínimas que necesitan los mappers (usuario + asuntoJuridico + createdBy + updatedBy).
 */
export type TarifaAbogadoAsuntoEntity = TarifaAbogadoAsunto & {
  usuario: Pick<User, "id" | "name" | "email">;
  asuntoJuridico: Pick<AsuntoJuridico, "id" | "nombre">;
  createdBy: Pick<User, "id" | "name">;
  updatedBy: Pick<User, "id" | "name">;
};

export type CreateTarifaAbogadoAsuntoArgs = {
  usuarioId: string;
  asuntoJuridicoId: string;
  tarifaHora: Prisma.Decimal | number;
  createdById: string;
  updatedById: string;
};

export type UpdateTarifaAbogadoAsuntoArgs = {
  id: string;
  tarifaHora: Prisma.Decimal | number;
  updatedById: string;
  motivo?: string | null;
};

export type DeactivateTarifaAbogadoAsuntoArgs = {
  id: string;
  updatedById: string;
};

export interface TarifaAbogadoAsuntoRepository {
  create(
    data: CreateTarifaAbogadoAsuntoArgs
  ): Promise<TarifaAbogadoAsuntoEntity>;
  update(
    data: UpdateTarifaAbogadoAsuntoArgs
  ): Promise<TarifaAbogadoAsuntoEntity>;
  deactivate(
    data: DeactivateTarifaAbogadoAsuntoArgs
  ): Promise<TarifaAbogadoAsuntoEntity>;
  findById(id: string): Promise<TarifaAbogadoAsuntoEntity | null>;
  /**
   * Devuelve la tarifa activa para (usuario, asunto) o `null` si no existe.
   * Es el lookup caliente que usa `RegistroHoraService.create` para
   * calcular `importe` y bloquear registros sin tarifa.
   */
  findActiveByUsuarioAndAsunto(
    usuarioId: string,
    asuntoJuridicoId: string
  ): Promise<{ id: string; tarifaHora: Prisma.Decimal } | null>;
  /**
   * Devuelve todas las tarifas activas. Para la matriz del módulo jurídico
   * y para la inicialización del sheet de horas.
   */
  findAllActive(): Promise<TarifaAbogadoAsuntoEntity[]>;
  /**
   * Devuelve las tarifas activas de un usuario específico. El sheet de
   * horas pide solo las del session.user (filtrado a su propio par).
   */
  findActiveByUsuario(
    usuarioId: string
  ): Promise<
    Array<{ id: string; usuarioId: string; asuntoJuridicoId: string; tarifaHora: Prisma.Decimal }>
  >;
}
