import type {
  RegistroHora,
  User,
  EquipoJuridico,
  ClienteProveedor,
  AsuntoJuridico,
  Socio,
  AutorizacionEdicion,
} from "@prisma/client";
import type { RegistroHorasFilterParams } from "../../types/RegistroHorasFilterParams";

export type RegistroHoraEntity = RegistroHora & {
  usuario: Pick<User, "id" | "name" | "email">;
  equipoJuridico: Pick<EquipoJuridico, "id" | "nombre">;
  clienteProveedor: Pick<ClienteProveedor, "id" | "nombre">;
  asuntoJuridico: Pick<AsuntoJuridico, "id" | "nombre">;
  socio: Pick<Socio, "id" | "nombre">;
  autorizaciones: Pick<AutorizacionEdicion, "id" | "estado">[];
};

export type CreateRegistroHoraArgs = {
  usuarioId: string;
  equipoJuridicoId: string;
  clienteProveedorId: string;
  asuntoJuridicoId: string;
  socioId: string;
  horas: number;
  /**
   * Snapshot de la tarifa activa al momento de registrar (frozen).
   * Persistido en la columna `tarifaHora` de RegistroHora.
   * Inmutable después del insert (ver UpdateRegistroHoraArgs).
   */
  tarifaHora: import("@prisma/client").Prisma.Decimal | number;
  /**
   * Importe derivado = horas × tarifaHora, persistido.
   * Recomputado en update SOLO si `horas` cambia.
   */
  importe: import("@prisma/client").Prisma.Decimal | number;
  descripcion?: string | null;
  ano: number;
  semana: number;
};

export type UpdateRegistroHoraArgs = {
  id: string;
  equipoJuridicoId: string;
  clienteProveedorId: string;
  asuntoJuridicoId: string;
  socioId: string;
  horas: number;
  /**
   * Importe recomputado por el service en update().
   * Si el caller no lo pasa, el service lo calcula a partir de la
   * `tarifaHora` congelada en la fila existente.
   *
   * `tarifaHora` NO está aquí: el repo update() nunca escribe esa
   * columna (REQ-RH-202: tarifaHora immutable post-insert).
   */
  importe?: import("@prisma/client").Prisma.Decimal | number | null;
  descripcion?: string | null;
};

export interface RegistroHoraRepository {
  create(data: CreateRegistroHoraArgs): Promise<RegistroHoraEntity>;
  update(data: UpdateRegistroHoraArgs): Promise<RegistroHoraEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<RegistroHoraEntity | null>;
  findByUsuarioAndWeek(
    usuarioId: string,
    ano: number,
    semana: number,
  ): Promise<RegistroHoraEntity[]>;
  getAll(): Promise<RegistroHoraEntity[]>;
  getAllByUsuario(usuarioId: string): Promise<RegistroHoraEntity[]>;
  setEditable(id: string, editable: boolean): Promise<void>;
  getPaginated(
    params: RegistroHorasFilterParams,
  ): Promise<{ data: RegistroHoraEntity[]; totalCount: number }>;
}
