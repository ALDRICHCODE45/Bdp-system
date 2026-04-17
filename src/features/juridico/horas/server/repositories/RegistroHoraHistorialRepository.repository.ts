import type { RegistroHoraHistorial } from "@prisma/client";

export type CreateRegistroHoraHistorialArgs = {
  registroHoraId: string;
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string;
  usuarioId?: string | null;
  motivo?: string | null;
};

export interface RegistroHoraHistorialRepository {
  create(data: CreateRegistroHoraHistorialArgs): Promise<RegistroHoraHistorial>;
  createMany(data: CreateRegistroHoraHistorialArgs[]): Promise<void>;
  findByRegistroHoraId(registroHoraId: string): Promise<RegistroHoraHistorial[]>;
}
