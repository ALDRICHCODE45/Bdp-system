import { PrismaClient } from "@prisma/client";
import type {
  ClienteJuridicoRepository,
  ClienteJuridicoEntity,
} from "../repositories/ClienteJuridicoRepository.repository";
import { Result, Ok, Err } from "@/core/shared/result/result";
import { ConflictError } from "@/core/shared/errors/domain";

type CreateClienteJuridicoInput = {
  nombre: string;
  rfc?: string | null;
  contacto?: string | null;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  notas?: string | null;
};

type UpdateClienteJuridicoInput = {
  id: string;
  nombre: string;
  rfc?: string | null;
  contacto?: string | null;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  notas?: string | null;
};

export class ClienteJuridicoService {
  constructor(
    private repo: ClienteJuridicoRepository,
    private prisma: PrismaClient
  ) {}

  async create(
    input: CreateClienteJuridicoInput
  ): Promise<Result<ClienteJuridicoEntity, Error>> {
    try {
      // Check for duplicate nombre (only among activo=true)
      const existing = await this.repo.findByNombre(input.nombre);
      if (existing) {
        return Err(
          new ConflictError(
            "CONFLICT",
            `Ya existe un cliente jurídico con el nombre "${input.nombre}"`
          )
        );
      }

      const created = await this.repo.create(input);
      return Ok(created);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al crear cliente jurídico")
      );
    }
  }

  async update(
    input: UpdateClienteJuridicoInput
  ): Promise<Result<ClienteJuridicoEntity, Error>> {
    try {
      // Check exists
      const existing = await this.repo.findById(input.id);
      if (!existing) {
        return Err(new Error("Cliente jurídico no encontrado"));
      }

      // Check duplicate nombre (excluding self)
      const duplicate = await this.repo.findByNombre(input.nombre);
      if (duplicate && duplicate.id !== input.id) {
        return Err(
          new ConflictError(
            "CONFLICT",
            `Ya existe un cliente jurídico con el nombre "${input.nombre}"`
          )
        );
      }

      const updated = await this.repo.update(input);
      return Ok(updated);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al actualizar cliente jurídico")
      );
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) {
        return Err(new Error("Cliente jurídico no encontrado"));
      }

      await this.repo.softDelete(id);
      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al eliminar cliente jurídico")
      );
    }
  }

  async getAll(): Promise<Result<ClienteJuridicoEntity[], Error>> {
    try {
      const clientes = await this.repo.getAll();
      return Ok(clientes);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener clientes jurídicos")
      );
    }
  }

  async getById(id: string): Promise<Result<ClienteJuridicoEntity, Error>> {
    try {
      const cliente = await this.repo.findById(id);
      if (!cliente) {
        return Err(new Error("Cliente jurídico no encontrado"));
      }
      return Ok(cliente);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener cliente jurídico")
      );
    }
  }
}
