import { PrismaClient } from "@prisma/client";
import type {
  AsuntoJuridicoRepository,
  AsuntoJuridicoEntity,
} from "../repositories/AsuntoJuridicoRepository.repository";
import { Result, Ok, Err } from "@/core/shared/result/result";
import { ConflictError } from "@/core/shared/errors/domain";

type CreateAsuntoJuridicoInput = {
  nombre: string;
  descripcion?: string | null;
  clienteJuridicoId: string;
  socioId: string;
};

type UpdateAsuntoJuridicoInput = {
  id: string;
  nombre: string;
  descripcion?: string | null;
  clienteJuridicoId: string;
  socioId: string;
  estado: "ACTIVO" | "INACTIVO" | "CERRADO";
};

export class AsuntoJuridicoService {
  constructor(
    private repo: AsuntoJuridicoRepository,
    private prisma: PrismaClient
  ) {}

  async create(
    input: CreateAsuntoJuridicoInput
  ): Promise<Result<AsuntoJuridicoEntity, Error>> {
    try {
      // Verify clienteJuridicoId exists and is activo
      const cliente = await this.prisma.clienteJuridico.findUnique({
        where: { id: input.clienteJuridicoId },
      });
      if (!cliente || !cliente.activo) {
        return Err(new Error("Cliente jurídico no encontrado o inactivo"));
      }

      // Verify socioId exists and is activo
      const socio = await this.prisma.socio.findUnique({
        where: { id: input.socioId },
      });
      if (!socio || !socio.activo) {
        return Err(new Error("Socio no encontrado o inactivo"));
      }

      // Check for duplicate nombre (among non-closed asuntos)
      const existing = await this.repo.findByNombre(input.nombre);
      if (existing) {
        return Err(
          new ConflictError(
            "CONFLICT",
            `Ya existe un asunto jurídico con el nombre "${input.nombre}"`
          )
        );
      }

      const created = await this.repo.create(input);
      return Ok(created);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al crear asunto jurídico")
      );
    }
  }

  async update(
    input: UpdateAsuntoJuridicoInput
  ): Promise<Result<AsuntoJuridicoEntity, Error>> {
    try {
      // Check exists
      const existing = await this.repo.findById(input.id);
      if (!existing) {
        return Err(new Error("Asunto jurídico no encontrado"));
      }

      // Verify clienteJuridicoId exists and is activo
      const cliente = await this.prisma.clienteJuridico.findUnique({
        where: { id: input.clienteJuridicoId },
      });
      if (!cliente || !cliente.activo) {
        return Err(new Error("Cliente jurídico no encontrado o inactivo"));
      }

      // Verify socioId exists and is activo
      const socio = await this.prisma.socio.findUnique({
        where: { id: input.socioId },
      });
      if (!socio || !socio.activo) {
        return Err(new Error("Socio no encontrado o inactivo"));
      }

      // Check duplicate nombre (excluding self)
      const duplicate = await this.repo.findByNombre(input.nombre);
      if (duplicate && duplicate.id !== input.id) {
        return Err(
          new ConflictError(
            "CONFLICT",
            `Ya existe un asunto jurídico con el nombre "${input.nombre}"`
          )
        );
      }

      const updated = await this.repo.update(input);
      return Ok(updated);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al actualizar asunto jurídico")
      );
    }
  }

  async close(id: string): Promise<Result<void, Error>> {
    try {
      const existing = await this.repo.findById(id);
      if (!existing) {
        return Err(new Error("Asunto jurídico no encontrado"));
      }

      await this.repo.delete(id);
      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al cerrar asunto jurídico")
      );
    }
  }

  async getAll(): Promise<Result<AsuntoJuridicoEntity[], Error>> {
    try {
      const asuntos = await this.repo.getAll();
      return Ok(asuntos);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener asuntos jurídicos")
      );
    }
  }

  async getById(id: string): Promise<Result<AsuntoJuridicoEntity, Error>> {
    try {
      const asunto = await this.repo.findById(id);
      if (!asunto) {
        return Err(new Error("Asunto jurídico no encontrado"));
      }
      return Ok(asunto);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener asunto jurídico")
      );
    }
  }
}
