import type { ClienteJuridico } from "@prisma/client";
import type { ClientesJuridicosFilterParams } from "../../types/ClientesJuridicosFilterParams";

export type ClienteJuridicoEntity = ClienteJuridico;

export type CreateClienteJuridicoArgs = {
  nombre: string;
  rfc?: string | null;
  contacto?: string | null;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  notas?: string | null;
};

export type UpdateClienteJuridicoArgs = {
  id: string;
  nombre: string;
  rfc?: string | null;
  contacto?: string | null;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  notas?: string | null;
};

export interface ClienteJuridicoRepository {
  create(data: CreateClienteJuridicoArgs): Promise<ClienteJuridicoEntity>;
  update(data: UpdateClienteJuridicoArgs): Promise<ClienteJuridicoEntity>;
  softDelete(id: string): Promise<void>;
  findById(id: string): Promise<ClienteJuridicoEntity | null>;
  findByNombre(nombre: string): Promise<ClienteJuridicoEntity | null>;
  getAll(): Promise<ClienteJuridicoEntity[]>;
  getPaginated(
    params: ClientesJuridicosFilterParams
  ): Promise<{ data: ClienteJuridicoEntity[]; totalCount: number }>;
}
