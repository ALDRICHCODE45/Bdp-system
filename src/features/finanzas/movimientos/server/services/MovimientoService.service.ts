import type { PrismaClient } from "@prisma/client";
import { Result, Ok, Err } from "@/core/shared/result/result";
import { ConflictError } from "@/core/shared/errors/domain";
import type {
  MovimientoRepository,
  MovimientoFilterParams,
  CreateMovimientoArgs,
  UpdateMovimientoArgs,
} from "../repositories/MovimientoRepository.repository";
import type { MovimientoHistorialRepository } from "../repositories/MovimientoHistorialRepository.repository";
import { PrismaMovimientoRepository } from "../repositories/PrismaMovimientoRepository.repository";
import { PrismaMovimientoHistorialRepository } from "../repositories/PrismaMovimientoHistorialRepository.repository";
import { MovimientoHistorialService } from "./MovimientoHistorialService.service";
import type { MovimientoDto } from "../dtos/MovimientoDto.dto";
import type { MovimientoListDto } from "../dtos/MovimientoListDto.dto";
import {
  toMovimientoDto,
  toMovimientoListItemDtoArray,
} from "../mappers/movimientoMapper";
import { computeMovimientoDedupHash } from "../../helpers/movimientoDedupHash";

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class MovimientoService {
  constructor(
    private readonly repo: MovimientoRepository,
    private readonly historialRepo: MovimientoHistorialRepository,
    private readonly prisma: PrismaClient
  ) {}

  // ── Read ─────────────────────────────────────────────────────────────────

  async getAll(
    params: MovimientoFilterParams
  ): Promise<Result<MovimientoListDto, Error>> {
    try {
      const { items, total, aggregates } = await this.repo.findAll(params);

      const page = Math.max(params.page ?? 1, 1);
      const pageSize = Math.min(Math.max(params.size ?? 25, 1), 200);

      return Ok({
        data: toMovimientoListItemDtoArray(items),
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
        aggregates: {
          totalIngresos: aggregates.totalIngresos.toString(),
          totalEgresos: aggregates.totalEgresos.toString(),
          count: aggregates.countIngresos + aggregates.countEgresos,
        },
      });
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener movimientos")
      );
    }
  }

  async getById(id: string): Promise<Result<MovimientoDto | null, Error>> {
    try {
      const entity = await this.repo.findById(id);
      return Ok(entity ? toMovimientoDto(entity) : null);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener movimiento")
      );
    }
  }

  async getDistinctTitulares(): Promise<Result<string[], Error>> {
    try {
      const titulares = await this.repo.getDistinctTitulares();
      return Ok(titulares);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener titulares")
      );
    }
  }

  // ── Create ───────────────────────────────────────────────────────────────

  async create(
    args: CreateMovimientoArgs & { ingresadoPor: string | null }
  ): Promise<Result<MovimientoDto, Error>> {
    try {
      // Compute dedupHash from input fields
      const dedupHash = computeMovimientoDedupHash({
        titular: args.titular,
        estadoCuenta: args.estadoCuenta,
        fechaOperacion: args.fechaOperacion,
        monto: args.monto,
        descripcionLiteral: args.descripcionLiteral,
      });

      // Check uniqueness
      const existing = await this.repo.findByDedupHash(dedupHash);
      if (existing) {
        return Err(
          new ConflictError(
            "DUPLICATE_MOVIMIENTO",
            "Ya existe un movimiento con los mismos datos identificatorios (titular, cuenta, fecha, monto, descripcion)"
          )
        );
      }

      const entity = await this.repo.create({
        ...args,
        dedupHash,
      });

      return Ok(toMovimientoDto(entity));
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al crear movimiento")
      );
    }
  }

  // ── Update ───────────────────────────────────────────────────────────────

  async update(
    args: UpdateMovimientoArgs & { usuarioId: string | null }
  ): Promise<Result<MovimientoDto, Error>> {
    try {
      const existing = await this.repo.findById(args.id);
      if (!existing) {
        return Err(new Error("Movimiento no encontrado"));
      }

      const result = await this.prisma.$transaction(async (tx) => {
        // Transaction-scoped instances
        const txRepo = new PrismaMovimientoRepository(tx);
        const txHistorialRepo = new PrismaMovimientoHistorialRepository(tx);
        const txHistorialService = new MovimientoHistorialService(
          txHistorialRepo
        );

        const { usuarioId, ...updateArgs } = args;
        const updated = await txRepo.update(updateArgs);

        // Record historial diff
        await txHistorialService.recordChanges({
          movimientoId: args.id,
          usuarioId,
          before: existing,
          after: updated,
        });

        return updated;
      });

      return Ok(toMovimientoDto(result));
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al actualizar movimiento")
      );
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) {
        return Err(new Error("Movimiento no encontrado"));
      }

      // Cascade delete handles historial
      await this.repo.delete(id);
      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al eliminar movimiento")
      );
    }
  }
}
