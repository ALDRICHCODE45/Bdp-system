import { ColaboradorHistorial } from "@prisma/client";

export type CreateHistorialArgs = {
  colaboradorId: string;
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string;
  usuarioId?: string | null;
  motivo?: string | null;
};

export interface ColaboradorHistorialRepository {
  create(data: CreateHistorialArgs): Promise<ColaboradorHistorial>;
  createMany(data: CreateHistorialArgs[]): Promise<void>;
  findByColaboradorId(data: {
    colaboradorId: string;
  }): Promise<ColaboradorHistorial[]>;
  findById(data: { id: string }): Promise<ColaboradorHistorial | null>;
}

