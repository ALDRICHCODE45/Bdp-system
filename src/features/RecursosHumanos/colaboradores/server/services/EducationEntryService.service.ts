import { PrismaClient } from "@prisma/client";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { EducationEntryRepository } from "../repositories/EducationEntryRepository.repository";
import {
  toEducationEntryDto,
  toEducationEntryDtoArray,
} from "../mappers/educationEntryMapper";
import type { EducationEntryDto } from "../dtos/EducationEntryDto.dto";

/**
 * Service-layer shape for the EducationEntry feature (cap10).
 *
 * Public methods:
 * - `listByColaborador` — read; no mutations.
 * - `create` — append a new education entry (REQUIRED institucion + titulo + anio).
 * - `update` — patch an existing entry.
 * - `delete` — remove an entry.
 * - `reorder` — bulk update the `orden` field for all entries of one
 *   colaborador (cap10 req3). Uses `prisma.$transaction` so a partial
 *   reorder is impossible (mirrors the SalaryHistory / PositionHistory
 *   transactional pattern).
 *
 * Every method returns a `Result<T, Error>` and never throws outside the
 * boundary — the Server Action layer is the only place where errors may
 * propagate to the client (CC2).
 *
 * `prisma` is held alongside the repository so the `reorder` op can open
 * a `$transaction` block. Single-row CRUD still goes through the repo to
 * keep the layering uniform.
 */
export class EducationEntryService {
  constructor(
    private readonly repository: EducationEntryRepository,
    private readonly prisma: PrismaClient
  ) {}

  async listByColaborador(
    colaboradorId: string
  ): Promise<Result<EducationEntryDto[], Error>> {
    try {
      const rows = await this.repository.findByColaboradorId({
        colaboradorId,
      });
      return Ok(toEducationEntryDtoArray(rows));
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener la formación académica")
      );
    }
  }

  async create(data: {
    colaboradorId: string;
    institucion: string;
    titulo: string;
    anio: number;
    orden?: number;
  }): Promise<Result<EducationEntryDto, Error>> {
    try {
      const row = await this.repository.create(data);
      return Ok(toEducationEntryDto(row));
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al crear la entrada de formación")
      );
    }
  }

  async update(data: {
    id: string;
    institucion: string;
    titulo: string;
    anio: number;
    orden?: number;
  }): Promise<Result<EducationEntryDto, Error>> {
    try {
      const existing = await this.repository.findById({ id: data.id });
      if (!existing) {
        return Err(new Error("Entrada de formación no encontrada"));
      }
      const row = await this.repository.update(data);
      return Ok(toEducationEntryDto(row));
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al actualizar la entrada de formación")
      );
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      const existing = await this.repository.findById({ id });
      if (!existing) {
        return Err(new Error("Entrada de formación no encontrada"));
      }
      await this.repository.delete({ id });
      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al eliminar la entrada de formación")
      );
    }
  }

  /**
   * Reorder the entries for one colaborador (cap10 req3). All updates run
   * inside a single `prisma.$transaction`; on any throw the partial reorder
   * is rolled back so the visible ordering never gets half-applied.
   */
  async reorder(data: {
    colaboradorId: string;
    items: { id: string; orden: number }[];
  }): Promise<Result<void, Error>> {
    try {
      if (data.items.length === 0) {
        return Ok(undefined);
      }
      await this.prisma.$transaction(
        data.items.map((item) =>
          this.prisma.educationEntry.updateMany({
            where: { id: item.id, colaboradorId: data.colaboradorId },
            data: { orden: item.orden },
          })
        )
      );
      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al reordenar la formación académica")
      );
    }
  }
}