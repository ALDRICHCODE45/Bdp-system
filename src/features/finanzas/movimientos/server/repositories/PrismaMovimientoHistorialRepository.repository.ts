import type { PrismaClient, MovimientoHistorial } from "@prisma/client";
import type {
  MovimientoHistorialRepository,
  CreateMovimientoHistorialArgs,
} from "./MovimientoHistorialRepository.repository";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class PrismaMovimientoHistorialRepository
  implements MovimientoHistorialRepository
{
  constructor(private prisma: PrismaClient | PrismaTransactionClient) {}

  async findByMovimientoId(
    movimientoId: string
  ): Promise<MovimientoHistorial[]> {
    return this.prisma.movimientoHistorial.findMany({
      where: { movimientoId },
      orderBy: { fechaCambio: "desc" },
    });
  }

  async create(args: CreateMovimientoHistorialArgs): Promise<MovimientoHistorial> {
    return this.prisma.movimientoHistorial.create({
      data: {
        movimientoId: args.movimientoId,
        campo: args.campo,
        valorAnterior: args.valorAnterior,
        valorNuevo: args.valorNuevo,
        usuarioId: args.usuarioId,
        motivo: args.motivo,
      },
    });
  }

  async createMany(args: CreateMovimientoHistorialArgs[]): Promise<number> {
    const result = await this.prisma.movimientoHistorial.createMany({
      data: args.map((a) => ({
        movimientoId: a.movimientoId,
        campo: a.campo,
        valorAnterior: a.valorAnterior,
        valorNuevo: a.valorNuevo,
        usuarioId: a.usuarioId,
        motivo: a.motivo,
      })),
    });
    return result.count;
  }
}
