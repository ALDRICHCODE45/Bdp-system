import { EgresoHistorial } from "@prisma/client";

export type CreateHistorialArgs = {
  egresoId: string;
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string;
  usuarioId?: string | null;
  motivo?: string | null;
};

export interface EgresoHistorialRepository {
  create(data: CreateHistorialArgs): Promise<EgresoHistorial>;
  createMany(data: CreateHistorialArgs[]): Promise<void>;
  findByEgresoId(data: { egresoId: string }): Promise<EgresoHistorial[]>;
  findById(data: { id: string }): Promise<EgresoHistorial | null>;
}

