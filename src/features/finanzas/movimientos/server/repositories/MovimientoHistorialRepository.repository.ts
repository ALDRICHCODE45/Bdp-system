import type { MovimientoHistorial } from "@prisma/client";

// ---------------------------------------------------------------------------
// Create args
// ---------------------------------------------------------------------------

export type CreateMovimientoHistorialArgs = {
  movimientoId: string;
  campo: string;
  valorAnterior: string | null;
  valorNuevo: string;
  usuarioId: string | null;
  motivo: string | null;
};

// ---------------------------------------------------------------------------
// Repository interface
// ---------------------------------------------------------------------------

export interface MovimientoHistorialRepository {
  findByMovimientoId(movimientoId: string): Promise<MovimientoHistorial[]>;

  create(args: CreateMovimientoHistorialArgs): Promise<MovimientoHistorial>;

  createMany(args: CreateMovimientoHistorialArgs[]): Promise<number>;
}
