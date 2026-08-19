import type { AsuntoJuridico, ClienteProveedor, Socio } from "@prisma/client";
import type { AsuntosJuridicosFilterParams } from "../../types/AsuntosJuridicosFilterParams";

export type AsuntoJuridicoEntity = AsuntoJuridico & {
  clienteProveedor?: Pick<ClienteProveedor, "id" | "nombre"> | null;
  socio?: Pick<Socio, "id" | "nombre"> | null;
};

export type CreateAsuntoJuridicoArgs = {
  nombre: string;
  descripcion?: string | null;
  clienteProveedorId: string;
  socioId: string;
};

export type UpdateAsuntoJuridicoArgs = {
  id: string;
  nombre: string;
  descripcion?: string | null;
  clienteProveedorId: string;
  socioId: string;
  estado: "ACTIVO" | "INACTIVO" | "CERRADO";
};

export interface AsuntoJuridicoRepository {
  create(data: CreateAsuntoJuridicoArgs): Promise<AsuntoJuridicoEntity>;
  update(data: UpdateAsuntoJuridicoArgs): Promise<AsuntoJuridicoEntity>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<AsuntoJuridicoEntity | null>;
  findByNombre(nombre: string): Promise<AsuntoJuridicoEntity | null>;
  getAll(): Promise<AsuntoJuridicoEntity[]>;
  getAllByCliente(clienteProveedorId: string): Promise<AsuntoJuridicoEntity[]>;
  getPaginated(
    params: AsuntosJuridicosFilterParams
  ): Promise<{ data: AsuntoJuridicoEntity[]; totalCount: number }>;
}
