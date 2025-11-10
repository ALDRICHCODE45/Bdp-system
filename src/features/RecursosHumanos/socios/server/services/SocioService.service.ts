import {
  SocioRepository,
  SocioEntity,
} from "../repositories/SocioRepository.repository";
import { Result, Err, Ok } from "@/core/shared/result/result";

type CreateSocioInput = {
  nombre: string;
  email: string;
  telefono?: string | null;
  activo: boolean;
  fechaIngreso: Date;
  departamento?: string | null;
  notas?: string | null;
};

type UpdateSocioInput = {
  id: string;
  nombre: string;
  email: string;
  telefono?: string | null;
  activo: boolean;
  fechaIngreso: Date;
  departamento?: string | null;
  notas?: string | null;
};

export class SocioService {
  constructor(private socioRepository: SocioRepository) {}

  async create(input: CreateSocioInput): Promise<Result<SocioEntity, Error>> {
    try {
      // Validar que el email no exista
      const emailExists = await this.socioRepository.findByEmail({
        email: input.email,
      });

      if (emailExists) {
        return Err(new Error("Ya existe un socio con ese email"));
      }

      const socio = await this.socioRepository.create(input);

      return Ok(socio);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al crear socio")
      );
    }
  }

  async update(input: UpdateSocioInput): Promise<Result<SocioEntity, Error>> {
    try {
      // Verificar que el socio existe
      const existingSocio = await this.socioRepository.findById({
        id: input.id,
      });

      if (!existingSocio) {
        return Err(new Error("Socio no encontrado"));
      }

      const socio = await this.socioRepository.update(input);

      return Ok(socio);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al actualizar socio")
      );
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      // Verificar que el socio existe
      const existingSocio = await this.socioRepository.findById({ id });

      if (!existingSocio) {
        return Err(new Error("Socio no encontrado"));
      }

      // Verificar que no tenga colaboradores asignados
      const colaboradoresCount = await this.socioRepository.countColaboradores({
        id,
      });

      if (colaboradoresCount > 0) {
        return Err(
          new Error(
            `No se puede eliminar el socio porque tiene ${colaboradoresCount} colaborador(es) asignado(s)`
          )
        );
      }

      await this.socioRepository.delete({ id });

      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al eliminar socio")
      );
    }
  }

  async getById(id: string): Promise<Result<SocioEntity, Error>> {
    try {
      const socio = await this.socioRepository.findById({ id });

      if (!socio) {
        return Err(new Error("Socio no encontrado"));
      }

      return Ok(socio);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al obtener socio")
      );
    }
  }

  async getAll(): Promise<Result<SocioEntity[], Error>> {
    try {
      const socios = await this.socioRepository.getAll();
      return Ok(socios);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al obtener socios")
      );
    }
  }
}
