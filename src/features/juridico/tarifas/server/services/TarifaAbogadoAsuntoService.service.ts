import { Prisma, type PrismaClient } from "@prisma/client";
import type {
  TarifaAbogadoAsuntoRepository,
  TarifaAbogadoAsuntoEntity,
  CreateTarifaAbogadoAsuntoArgs,
  UpdateTarifaAbogadoAsuntoArgs,
  DeactivateTarifaAbogadoAsuntoArgs,
} from "../repositories/TarifaAbogadoAsuntoRepository.repository";
import type { TarifaAbogadoAsuntoHistorialRepository } from "../repositories/TarifaAbogadoAsuntoHistorialRepository.repository";
import { Result, Ok, Err } from "@/core/shared/result/result";
import { ValidationError } from "@/core/shared/errors/domain";

export class TarifaAbogadoAsuntoService {
  constructor(
    private repo: TarifaAbogadoAsuntoRepository,
    private historialRepo: TarifaAbogadoAsuntoHistorialRepository,
    private prisma: PrismaClient,
  ) {}

  /**
   * Crea una nueva tarifa activa. Rechaza `tarifaHora <= 0` con
   * `Err(ValidationError("La tarifa por hora debe ser mayor a 0"))`.
   * Garantiza la unicidad del par (usuarioId, asuntoJuridicoId) —
   * un `@@unique` en la DB hace cumplir el constraint.
   */
  async create(
    args: CreateTarifaAbogadoAsuntoArgs,
  ): Promise<Result<TarifaAbogadoAsuntoEntity, Error>> {
    try {
      const tarifaHoraNum =
        args.tarifaHora instanceof Prisma.Decimal
          ? args.tarifaHora.toNumber()
          : args.tarifaHora;

      // REQ-TAA-006: tarifaHora > 0 (rechaza 0 y negativos)
      if (tarifaHoraNum <= 0) {
        return Err(
          new ValidationError("La tarifa por hora debe ser mayor a 0"),
        );
      }

      // Sanity-check FKs: el abogado y el asunto deben existir y estar activos.
      const [usuario, asunto] = await Promise.all([
        this.prisma.user.findUnique({ where: { id: args.usuarioId } }),
        this.prisma.asuntoJuridico.findUnique({
          where: { id: args.asuntoJuridicoId },
        }),
      ]);
      if (!usuario || !usuario.isActive) {
        return Err(
          new Error("El abogado seleccionado no existe o está inactivo"),
        );
      }
      if (!asunto || asunto.estado !== "ACTIVO") {
        return Err(
          new Error(
            "El asunto jurídico seleccionado no existe o no está activo",
          ),
        );
      }

      // Si ya existe una tarifa activa para el par, devolvemos Conflict.
      const existing = await this.repo.findActiveByUsuarioAndAsunto(
        args.usuarioId,
        args.asuntoJuridicoId,
      );
      if (existing) {
        return Err(
          new Error(
            "Ya existe una tarifa activa para este abogado y asunto. Edítala o desactívala primero.",
          ),
        );
      }

      const created = await this.repo.create(args);

      // Historial: la creación también queda registrada (tarifaHoraAnterior = null).
      await this.historialRepo.create({
        tarifaId: created.id,
        tarifaHoraAnterior: null,
        tarifaHoraNueva: created.tarifaHora,
        changedById: args.createdById,
        motivo: "Creación inicial",
      });

      return Ok(created);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return Err(
            new Error("Ya existe una tarifa para este par (abogado, asunto)."),
          );
        }
      }
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al crear tarifa de abogado por asunto"),
      );
    }
  }

  /**
   * Actualiza `tarifaHora` y, en la MISMA transacción, escribe la fila
   * de historial que registra el cambio (REQ-TAA-004: both-or-neither).
   */
  async update(
    args: UpdateTarifaAbogadoAsuntoArgs,
  ): Promise<Result<TarifaAbogadoAsuntoEntity, Error>> {
    try {
      const tarifaHoraNum =
        args.tarifaHora instanceof Prisma.Decimal
          ? args.tarifaHora.toNumber()
          : args.tarifaHora;

      if (tarifaHoraNum <= 0) {
        return Err(
          new ValidationError("La tarifa por hora debe ser mayor a 0"),
        );
      }

      const existing = await this.repo.findById(args.id);
      if (!existing) {
        return Err(new Error("Tarifa no encontrada"));
      }
      if (!existing.activa) {
        return Err(
          new Error(
            "La tarifa está desactivada. Créala nuevamente si necesitas reactivarla.",
          ),
        );
      }

      // REQ-TAA-004: row + history in ONE $transaction.
      const updated = await this.prisma.$transaction(async (tx) => {
        const updatedRow = await tx.tarifaAbogadoAsunto.update({
          where: { id: args.id },
          data: {
            tarifaHora: new Prisma.Decimal(
              args.tarifaHora as number | Prisma.Decimal,
            ),
            updatedById: args.updatedById,
          },
          include: {
            usuario: { select: { id: true, name: true, email: true } },
            asuntoJuridico: { select: { id: true, nombre: true } },
            createdBy: { select: { id: true, name: true } },
            updatedBy: { select: { id: true, name: true } },
          },
        });

        await tx.tarifaAbogadoAsuntoHistorial.create({
          data: {
            tarifaId: args.id,
            tarifaHoraAnterior: existing.tarifaHora,
            tarifaHoraNueva: updatedRow.tarifaHora,
            changedById: args.updatedById,
            motivo: args.motivo ?? null,
          },
        });

        return updatedRow;
      });

      return Ok(updated as TarifaAbogadoAsuntoEntity);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al actualizar tarifa de abogado por asunto"),
      );
    }
  }

  /**
   * Soft-delete: `activa = false`. Preserva los `tarifaHora` ya
   * frozen en `RegistroHora` (REQ-TAA-005).
   */
  async deactivate(
    args: DeactivateTarifaAbogadoAsuntoArgs,
  ): Promise<Result<TarifaAbogadoAsuntoEntity, Error>> {
    try {
      const existing = await this.repo.findById(args.id);
      if (!existing) {
        return Err(new Error("Tarifa no encontrada"));
      }
      const deactivated = await this.repo.deactivate(args);
      return Ok(deactivated);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al desactivar tarifa"),
      );
    }
  }

  async getAllActive(): Promise<Result<TarifaAbogadoAsuntoEntity[], Error>> {
    try {
      const tarifas = await this.repo.findAllActive();
      return Ok(tarifas);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener tarifas activas"),
      );
    }
  }

  /**
   * Devuelve las tarifas activas de un usuario específico. Usado por
   * el sheet de horas para greyar asuntos sin tarifa.
   */
  async getActiveByUsuario(usuarioId: string): Promise<
    Result<
      Array<{
        id: string;
        usuarioId: string;
        asuntoJuridicoId: string;
        tarifaHora: Prisma.Decimal;
      }>,
      Error
    >
  > {
    try {
      const tarifas = await this.repo.findActiveByUsuario(usuarioId);
      return Ok(tarifas);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener tarifas del usuario"),
      );
    }
  }

  /**
   * Devuelve el historial append-only de una tarifa, newest-first.
   */
  async getHistorialByTarifaId(tarifaId: string): Promise<
    Result<
      Array<{
        id: string;
        tarifaId: string;
        tarifaHoraAnterior: Prisma.Decimal | null;
        tarifaHoraNueva: Prisma.Decimal;
        changedById: string;
        changedBy: { id: string; name: string };
        motivo: string | null;
        changedAt: Date;
      }>,
      Error
    >
  > {
    try {
      const rows = await this.historialRepo.findByTarifaId(tarifaId);
      return Ok(rows);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener historial de la tarifa"),
      );
    }
  }
}
