import { PrismaClient } from "@prisma/client";
import type {
  EquipoJuridicoRepository,
  EquipoJuridicoEntity,
} from "../repositories/EquipoJuridicoRepository.repository";
import { Result, Ok, Err } from "@/core/shared/result/result";
import { ConflictError } from "@/core/shared/errors/domain";
import type { EquiposJuridicosFilterParams } from "../../types/EquiposJuridicosFilterParams";

type CreateEquipoJuridicoInput = {
  nombre: string;
  descripcion?: string | null;
};

type UpdateEquipoJuridicoInput = {
  id: string;
  nombre: string;
  descripcion?: string | null;
};

export class EquipoJuridicoService {
  constructor(
    private repo: EquipoJuridicoRepository,
    private prisma: PrismaClient
  ) {}

  async create(
    input: CreateEquipoJuridicoInput
  ): Promise<Result<EquipoJuridicoEntity, Error>> {
    try {
      const existing = await this.repo.findByNombre(input.nombre);
      if (existing) {
        return Err(
          new ConflictError(
            "CONFLICT",
            `Ya existe un equipo jurídico con el nombre "${input.nombre}"`
          )
        );
      }

      const created = await this.repo.create(input);
      return Ok(created);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al crear equipo jurídico")
      );
    }
  }

  async update(
    input: UpdateEquipoJuridicoInput
  ): Promise<Result<EquipoJuridicoEntity, Error>> {
    try {
      const existing = await this.repo.findById(input.id);
      if (!existing) {
        return Err(new Error("Equipo jurídico no encontrado"));
      }

      const duplicate = await this.repo.findByNombre(input.nombre);
      if (duplicate && duplicate.id !== input.id) {
        return Err(
          new ConflictError(
            "CONFLICT",
            `Ya existe un equipo jurídico con el nombre "${input.nombre}"`
          )
        );
      }

      const updated = await this.repo.update(input);
      return Ok(updated);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al actualizar equipo jurídico")
      );
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) {
        return Err(new Error("Equipo jurídico no encontrado"));
      }

      await this.repo.softDelete(id);
      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al eliminar equipo jurídico")
      );
    }
  }

  async getAll(): Promise<Result<EquipoJuridicoEntity[], Error>> {
    try {
      const equipos = await this.repo.getAll();
      return Ok(equipos);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener equipos jurídicos")
      );
    }
  }

  async getById(id: string): Promise<Result<EquipoJuridicoEntity, Error>> {
    try {
      const equipo = await this.repo.findById(id);
      if (!equipo) {
        return Err(new Error("Equipo jurídico no encontrado"));
      }
      return Ok(equipo);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener equipo jurídico")
      );
    }
  }

  async addMiembro(
    equipoId: string,
    usuarioId: string
  ): Promise<Result<void, Error>> {
    try {
      // Verify equipo exists and is activo
      const equipo = await this.repo.findById(equipoId);
      if (!equipo) {
        return Err(new Error("Equipo jurídico no encontrado"));
      }
      if (!equipo.activo) {
        return Err(new Error("El equipo jurídico está inactivo"));
      }

      // Verify user exists and isActive
      const user = await this.prisma.user.findUnique({
        where: { id: usuarioId },
        select: { id: true, isActive: true },
      });
      if (!user) {
        return Err(new Error("Usuario no encontrado"));
      }
      if (!user.isActive) {
        return Err(new Error("El usuario está inactivo"));
      }

      // Check not already a member
      const alreadyMember = equipo.miembros.some(
        (m) => m.usuarioId === usuarioId
      );
      if (alreadyMember) {
        return Err(
          new ConflictError(
            "CONFLICT",
            "El usuario ya es miembro de este equipo"
          )
        );
      }

      await this.repo.addMiembro(equipoId, usuarioId);
      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al agregar miembro al equipo")
      );
    }
  }

  async removeMiembro(
    equipoId: string,
    usuarioId: string
  ): Promise<Result<void, Error>> {
    try {
      const equipo = await this.repo.findById(equipoId);
      if (!equipo) {
        return Err(new Error("Equipo jurídico no encontrado"));
      }

      await this.repo.removeMiembro(equipoId, usuarioId);
      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al remover miembro del equipo")
      );
    }
  }

  async getPaginated(
    params: EquiposJuridicosFilterParams
  ): Promise<
    Result<{ data: EquipoJuridicoEntity[]; totalCount: number }, Error>
  > {
    try {
      const result = await this.repo.getPaginated(params);
      return Ok(result);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener equipos jurídicos")
      );
    }
  }
}
