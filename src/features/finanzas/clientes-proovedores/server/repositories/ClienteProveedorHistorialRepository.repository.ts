import { ClienteProveedorHistorial } from "@prisma/client";

export type CreateHistorialArgs = {
  clienteProveedorId: string;
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string;
  usuarioId?: string | null;
  motivo?: string | null;
};

export interface ClienteProveedorHistorialRepository {
  create(data: CreateHistorialArgs): Promise<ClienteProveedorHistorial>;
  createMany(data: CreateHistorialArgs[]): Promise<void>;
  findByClienteProveedorId(data: {
    clienteProveedorId: string;
  }): Promise<ClienteProveedorHistorial[]>;
  findById(data: { id: string }): Promise<ClienteProveedorHistorial | null>;
}

