import { IngresoHistorial } from "@prisma/client";

export type CreateHistorialArgs = {
  ingresoId: string;
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string;
  usuarioId?: string | null;
  motivo?: string | null;
};

export interface IngresoHistorialRepository {
  create(data: CreateHistorialArgs): Promise<IngresoHistorial>;
  createMany(data: CreateHistorialArgs[]): Promise<void>;
  findByIngresoId(data: { ingresoId: string }): Promise<IngresoHistorial[]>;
  findById(data: { id: string }): Promise<IngresoHistorial | null>;
}

