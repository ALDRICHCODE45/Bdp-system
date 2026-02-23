import { PrismaClient } from "@prisma/client";
import { Result, Err, Ok } from "@/core/shared/result/result";
import {
  FacturaRepository,
  FacturaEntity,
} from "../repositories/FacturaRepository.repository";
import {
  CreateFacturaInput,
  createFacturaSchema,
} from "../validators/createFacturaSchema";
import {
  UpdateFacturaInput,
  updateFacturaSchema,
} from "../validators/updateFacturaSchema";
import { FacturaHistorialService } from "./FacturaHistorialService.service";
import { FacturasFilterParams } from "../../types/FacturasFilterParams";

type CreateFacturaInputWithUsuario = CreateFacturaInput & {
  usuarioId?: string | null;
};

type UpdateFacturaInputWithUsuario = UpdateFacturaInput & {
  usuarioId?: string | null;
};

export class FacturaService {
  constructor(
    private facturaRepository: FacturaRepository,
    private historialService: FacturaHistorialService,
    private prisma: PrismaClient
  ) {}

  async create(
    input: CreateFacturaInputWithUsuario
  ): Promise<Result<FacturaEntity, Error>> {
    // Validar entrada
    const validationResult = createFacturaSchema.safeParse(input);
    if (!validationResult.success) {
      return Err(new Error(validationResult.error.message));
    }

    // 1. Validar uuid unico
    const uuidExists = await this.facturaRepository.findByUuid(input.uuid);
    if (uuidExists) {
      return Err(new Error("Ya existe una factura con ese UUID"));
    }

    // 2. Crear factura con historial usando transaccion
    try {
      const factura = await this.prisma.$transaction(async (tx) => {
        const { PrismaFacturaRepository } = await import(
          "../repositories/PrismaFacturaRepository.repository"
        );
        const { PrismaFacturaHistorialRepository } = await import(
          "../repositories/PrismaFacturaHistorialRepository.repository"
        );
        const { FacturaHistorialService } = await import(
          "./FacturaHistorialService.service"
        );

        const tempFacturaRepository = new PrismaFacturaRepository(tx);
        const tempHistorialRepository = new PrismaFacturaHistorialRepository(tx);
        const tempHistorialService = new FacturaHistorialService(
          tempHistorialRepository
        );

        const newFactura = await tempFacturaRepository.create({
          ...input,
          ingresadoPor: input.usuarioId || null,
        });

        await tempHistorialService.createHistorialForNewFactura(
          newFactura,
          input.usuarioId
        );
        return newFactura;
      });

      return Ok(factura);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al crear la factura")
      );
    }
  }

  async update(
    input: UpdateFacturaInputWithUsuario
  ): Promise<Result<FacturaEntity, Error>> {
    // Validar entrada
    const validationResult = updateFacturaSchema.safeParse(input);
    if (!validationResult.success) {
      return Err(new Error(validationResult.error.message));
    }

    const existing = await this.facturaRepository.findById({ id: input.id });
    if (!existing) {
      return Err(new Error("Factura no encontrada"));
    }

    // Validar uuid unico si cambio
    if (input.uuid !== existing.uuid) {
      const uuidExists = await this.facturaRepository.findByUuid(input.uuid);
      if (uuidExists) {
        return Err(new Error("Ya existe una factura con ese UUID"));
      }
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const { PrismaFacturaRepository } = await import(
          "../repositories/PrismaFacturaRepository.repository"
        );
        const { PrismaFacturaHistorialRepository } = await import(
          "../repositories/PrismaFacturaHistorialRepository.repository"
        );
        const { FacturaHistorialService } = await import(
          "./FacturaHistorialService.service"
        );

        const tempFacturaRepository = new PrismaFacturaRepository(tx);
        const tempHistorialRepository = new PrismaFacturaHistorialRepository(tx);
        const tempHistorialService = new FacturaHistorialService(
          tempHistorialRepository
        );

        const updatedFactura = await tempFacturaRepository.update({
          ...input,
        });

        await tempHistorialService.createHistorialForUpdate(
          existing,
          updatedFactura,
          input.usuarioId
        );
        return updatedFactura;
      });

      return Ok(result);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al actualizar la factura")
      );
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    const existing = await this.facturaRepository.findById({ id });
    if (!existing) {
      return Err(new Error("Factura no encontrada"));
    }

    // Solo permitir eliminar si esta en BORRADOR
    if (existing.status !== "BORRADOR") {
      return Err(
        new Error("Solo se pueden eliminar facturas en estado BORRADOR")
      );
    }

    try {
      await this.facturaRepository.delete({ id });
      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al eliminar la factura")
      );
    }
  }

  async getById(id: string): Promise<Result<FacturaEntity, Error>> {
    try {
      const factura = await this.facturaRepository.findById({ id });
      if (!factura) {
        return Err(new Error("Factura no encontrada"));
      }
      return Ok(factura);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener la factura")
      );
    }
  }

  async getAll(): Promise<Result<FacturaEntity[], Error>> {
    try {
      const facturas = await this.facturaRepository.getAll();
      return Ok(facturas);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener las facturas")
      );
    }
  }

  async getPaginated(params: FacturasFilterParams): Promise<Result<{ data: FacturaEntity[]; totalCount: number }, Error>> {
    try {
      const result = await this.facturaRepository.getPaginated(params);
      return Ok(result);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Error al obtener facturas paginadas"));
    }
  }
}
