import { Result, Err, Ok } from "@/core/shared/result/result";
import { ResponsabilidadCargoRepository } from "../repositories/ResponsabilidadCargoRepository.repository";
import {
  toResponsabilidadCargoDto,
  toResponsabilidadCargoDtoArray,
} from "../mappers/responsabilidadCargoMapper";
import type { ResponsabilidadCargoDto } from "../dtos/ResponsabilidadCargoDto.dto";

/**
 * Service-layer shape for the ResponsabilidadCargo feature. Mirrors the
 * small CRUD shape of `PermissionService` / `RoleService` / `EmergencyContactService`.
 *
 * Every method returns a `Result<T, Error>` and never throws outside the
 * boundary — the Server Action layer is the only place where errors may
 * propagate to the client (CC2).
 */
export class ResponsabilidadCargoService {
  constructor(private readonly repository: ResponsabilidadCargoRepository) {}

  async listByColaborador(
    colaboradorId: string
  ): Promise<Result<ResponsabilidadCargoDto[], Error>> {
    try {
      const rows = await this.repository.findByColaboradorId({
        colaboradorId,
      });
      return Ok(toResponsabilidadCargoDtoArray(rows));
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener responsabilidades del cargo")
      );
    }
  }

  async create(data: {
    colaboradorId: string;
    descripcion: string;
    orden?: number;
    completada?: boolean;
  }): Promise<Result<ResponsabilidadCargoDto, Error>> {
    try {
      const row = await this.repository.create(data);
      return Ok(toResponsabilidadCargoDto(row));
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al crear responsabilidad del cargo")
      );
    }
  }

  async update(data: {
    id: string;
    descripcion: string;
    orden?: number;
    completada?: boolean;
  }): Promise<Result<ResponsabilidadCargoDto, Error>> {
    try {
      const existing = await this.repository.findById({ id: data.id });
      if (!existing) {
        return Err(new Error("Responsabilidad no encontrada"));
      }
      const row = await this.repository.update(data);
      return Ok(toResponsabilidadCargoDto(row));
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al actualizar responsabilidad del cargo")
      );
    }
  }

  /**
   * Toggle the `completada` flag. Encoded as a separate method so the toggle
   * control in the UI doesn't have to know about `descripcion` validation.
   */
  async toggleCompletada(data: {
    id: string;
    completada: boolean;
  }): Promise<Result<ResponsabilidadCargoDto, Error>> {
    try {
      const existing = await this.repository.findById({ id: data.id });
      if (!existing) {
        return Err(new Error("Responsabilidad no encontrada"));
      }
      const row = await this.repository.toggleCompletada(data);
      return Ok(toResponsabilidadCargoDto(row));
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al alternar el estado de la responsabilidad")
      );
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      const existing = await this.repository.findById({ id });
      if (!existing) {
        return Err(new Error("Responsabilidad no encontrada"));
      }
      await this.repository.delete({ id });
      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al eliminar responsabilidad del cargo")
      );
    }
  }
}
