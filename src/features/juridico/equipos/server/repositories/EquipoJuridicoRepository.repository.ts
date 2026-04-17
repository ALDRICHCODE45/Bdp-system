import type { EquipoJuridico, User } from "@prisma/client";
import type { EquiposJuridicosFilterParams } from "../../types/EquiposJuridicosFilterParams";

export type EquipoJuridicoMiembro = {
  id: string;
  usuarioId: string;
  equipoId: string;
  createdAt: Date;
  usuario: Pick<User, "id" | "name" | "email">;
};

export type EquipoJuridicoEntity = EquipoJuridico & {
  miembros: EquipoJuridicoMiembro[];
};

export type CreateEquipoJuridicoArgs = {
  nombre: string;
  descripcion?: string | null;
};

export type UpdateEquipoJuridicoArgs = {
  id: string;
  nombre: string;
  descripcion?: string | null;
};

export interface EquipoJuridicoRepository {
  create(data: CreateEquipoJuridicoArgs): Promise<EquipoJuridicoEntity>;
  update(data: UpdateEquipoJuridicoArgs): Promise<EquipoJuridicoEntity>;
  softDelete(id: string): Promise<void>;
  findById(id: string): Promise<EquipoJuridicoEntity | null>;
  findByNombre(nombre: string): Promise<EquipoJuridicoEntity | null>;
  getAll(): Promise<EquipoJuridicoEntity[]>;
  addMiembro(equipoId: string, usuarioId: string): Promise<void>;
  removeMiembro(equipoId: string, usuarioId: string): Promise<void>;
  getPaginated(
    params: EquiposJuridicosFilterParams
  ): Promise<{ data: EquipoJuridicoEntity[]; totalCount: number }>;
}
