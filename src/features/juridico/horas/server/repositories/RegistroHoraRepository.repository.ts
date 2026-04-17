import type {
  RegistroHora,
  User,
  EquipoJuridico,
  ClienteJuridico,
  AsuntoJuridico,
  Socio,
} from "@prisma/client";
import type { RegistroHorasFilterParams } from "../../types/RegistroHorasFilterParams";

export type RegistroHoraEntity = RegistroHora & {
  usuario: Pick<User, "id" | "name" | "email">;
  equipoJuridico: Pick<EquipoJuridico, "id" | "nombre">;
  clienteJuridico: Pick<ClienteJuridico, "id" | "nombre">;
  asuntoJuridico: Pick<AsuntoJuridico, "id" | "nombre">;
  socio: Pick<Socio, "id" | "nombre">;
};

export type CreateRegistroHoraArgs = {
  usuarioId: string;
  equipoJuridicoId: string;
  clienteJuridicoId: string;
  asuntoJuridicoId: string;
  socioId: string;
  horas: number;
  descripcion?: string | null;
  ano: number;
  semana: number;
};

export type UpdateRegistroHoraArgs = {
  id: string;
  equipoJuridicoId: string;
  clienteJuridicoId: string;
  asuntoJuridicoId: string;
  socioId: string;
  horas: number;
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
    semana: number
  ): Promise<RegistroHoraEntity[]>;
  getAll(): Promise<RegistroHoraEntity[]>;
  getAllByUsuario(usuarioId: string): Promise<RegistroHoraEntity[]>;
  setEditable(id: string, editable: boolean): Promise<void>;
  getPaginated(
    params: RegistroHorasFilterParams
  ): Promise<{ data: RegistroHoraEntity[]; totalCount: number }>;
}
