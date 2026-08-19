import { Prisma, type PrismaClient } from "@prisma/client";
import type {
  TarifaAbogadoAsuntoHistorialRepository,
  TarifaAbogadoAsuntoHistorialEntity,
  CreateTarifaAbogadoAsuntoHistorialArgs,
} from "./TarifaAbogadoAsuntoHistorialRepository.repository";

const historialIncludes = {
  changedBy: { select: { id: true, name: true } },
} as const;

/**
 * Implementación append-only del repo de historial de tarifas.
 *
 * IMPORTANTE: Esta clase intencionalmente NO expone `update` ni `delete`.
 * El historial es read-only después del insert (audit / regulatorio).
 * Para cumplir ese contrato, evitamos incluso definir esos métodos.
 */
export class PrismaTarifaAbogadoAsuntoHistorialRepository implements TarifaAbogadoAsuntoHistorialRepository {
  constructor(private prisma: PrismaClient) {}

  async create(
    data: CreateTarifaAbogadoAsuntoHistorialArgs,
  ): Promise<TarifaAbogadoAsuntoHistorialEntity> {
    return await this.prisma.tarifaAbogadoAsuntoHistorial.create({
      data: {
        tarifaId: data.tarifaId,
        tarifaHoraAnterior:
          data.tarifaHoraAnterior === null ||
          data.tarifaHoraAnterior === undefined
            ? null
            : new Prisma.Decimal(
                data.tarifaHoraAnterior as number | Prisma.Decimal,
              ),
        tarifaHoraNueva: new Prisma.Decimal(
          data.tarifaHoraNueva as number | Prisma.Decimal,
        ),
        changedById: data.changedById,
        motivo: data.motivo ?? null,
      },
      include: historialIncludes,
    });
  }

  async findByTarifaId(
    tarifaId: string,
  ): Promise<TarifaAbogadoAsuntoHistorialEntity[]> {
    return await this.prisma.tarifaAbogadoAsuntoHistorial.findMany({
      where: { tarifaId },
      orderBy: { changedAt: "desc" },
      include: historialIncludes,
    });
  }
}
