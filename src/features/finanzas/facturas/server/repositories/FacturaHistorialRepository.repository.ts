import { FacturaHistorial } from "@prisma/client";

export type CreateHistorialArgs = {
  facturaId: string;
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string;
  usuarioId?: string | null;
  motivo?: string | null;
};

export interface FacturaHistorialRepository {
  create(data: CreateHistorialArgs): Promise<FacturaHistorial>;
  createMany(data: CreateHistorialArgs[]): Promise<void>;
  findByFacturaId(data: { facturaId: string }): Promise<FacturaHistorial[]>;
  findById(data: { id: string }): Promise<FacturaHistorial | null>;
}

