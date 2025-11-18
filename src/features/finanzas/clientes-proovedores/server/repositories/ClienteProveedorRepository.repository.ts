import { ClienteProveedor, Socio } from "@prisma/client";

export type ClienteProveedorEntity = ClienteProveedor & {
  socio?: Socio | null;
};

export type CreateClienteProveedorArgs = {
  nombre: string;
  rfc: string;
  tipo: "CLIENTE" | "PROVEEDOR";
  direccion: string;
  telefono: string;
  email: string;
  contacto: string;
  numeroCuenta?: string | null;
  clabe?: string | null;
  banco?: string | null;
  activo: boolean;
  fechaRegistro: Date;
  notas?: string | null;
  socioId?: string | null;
};

export type UpdateClienteProveedorArgs = {
  id: string;
  nombre: string;
  rfc: string;
  tipo: "CLIENTE" | "PROVEEDOR";
  direccion: string;
  telefono: string;
  email: string;
  contacto: string;
  numeroCuenta?: string | null;
  clabe?: string | null;
  banco?: string | null;
  activo: boolean;
  fechaRegistro: Date;
  notas?: string | null;
  socioId?: string | null;
};

export interface ClienteProveedorRepository {
  create(data: CreateClienteProveedorArgs): Promise<ClienteProveedorEntity>;
  update(data: UpdateClienteProveedorArgs): Promise<ClienteProveedorEntity>;
  delete(data: { id: string }): Promise<void>;
  findById(data: { id: string }): Promise<ClienteProveedorEntity | null>;
  findByRfcAndTipo(data: { rfc: string; tipo: string }): Promise<boolean>;
  getAll(): Promise<ClienteProveedorEntity[]>;
}
