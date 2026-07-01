import { Result, Err, Ok } from "@/core/shared/result/result";
import { EmergencyContactRepository } from "../repositories/EmergencyContactRepository.repository";
import {
  toEmergencyContactDto,
  toEmergencyContactDtoArray,
} from "../mappers/emergencyContactMapper";
import type { EmergencyContactDto } from "../dtos/EmergencyContactDto.dto";

/**
 * Service-layer shape for the EmergencyContact feature. Mirrors the small
 * CRUD shape of `PermissionService` / `RoleService`.
 *
 * Every method returns a `Result<T, Error>` and never throws outside the
 * boundary — the Server Action layer is the only place where errors may
 * propagate to the client (CC2).
 */
export class EmergencyContactService {
  constructor(
    private readonly repository: EmergencyContactRepository
  ) {}

  async listByColaborador(
    colaboradorId: string
  ): Promise<Result<EmergencyContactDto[], Error>> {
    try {
      const rows = await this.repository.findByColaboradorId({
        colaboradorId,
      });
      return Ok(toEmergencyContactDtoArray(rows));
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener contactos de emergencia")
      );
    }
  }

  async create(data: {
    colaboradorId: string;
    nombre: string;
    parentesco: string;
    telefono: string;
    email?: string | null;
    notas?: string | null;
  }): Promise<Result<EmergencyContactDto, Error>> {
    try {
      const row = await this.repository.create(data);
      return Ok(toEmergencyContactDto(row));
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al crear contacto de emergencia")
      );
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      const existing = await this.repository.findById({ id });
      if (!existing) {
        return Err(new Error("Contacto de emergencia no encontrado"));
      }
      await this.repository.delete({ id });
      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al eliminar contacto de emergencia")
      );
    }
  }
}
