import { Err, Ok, type Result } from "@/core/shared/result/result";
import type {
  ReporteAgrupadoPageDto,
  ReporteAgrupadoFilters,
  ReporteGrupoDto,
  SubtotalesDto,
} from "../dtos/ReporteHorasAgrupadoDto.dto";
import type {
  ReporteHorasAgrupadoRepository,
  ReporteAgrupadoPageArgs,
} from "../repositories/ReporteHorasAgrupadoRepository.repository";

/**
 * Orquesta el repositorio Prisma. Result<T, E> — nunca throws (excepto bugs).
 * El mapper ya se aplica DENTRO del repo; aquí solo se enrutan los filtros.
 */
export class ReporteHorasAgrupadoService {
  constructor(private repo: ReporteHorasAgrupadoRepository) {}

  async getAgrupado(
    args: ReporteAgrupadoPageArgs,
  ): Promise<Result<ReporteAgrupadoPageDto, Error>> {
    try {
      const result = await this.repo.getAgrupado(args);
      return Ok(result);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener el reporte agrupado"),
      );
    }
  }

  async getAgrupadoAll(
    filters: ReporteAgrupadoFilters,
  ): Promise<Result<ReporteGrupoDto[], Error>> {
    try {
      const result = await this.repo.getAgrupadoAll(filters);
      return Ok(result);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener los grupos para exportación"),
      );
    }
  }

  async getSubtotales(
    filters: ReporteAgrupadoFilters,
  ): Promise<Result<SubtotalesDto, Error>> {
    try {
      const result = await this.repo.getSubtotales(filters);
      return Ok(result);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener los subtotales"),
      );
    }
  }
}
