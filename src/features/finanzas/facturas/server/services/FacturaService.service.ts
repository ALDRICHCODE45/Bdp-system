import { PrismaClient } from "@prisma/client";
import { Result, Err, Ok } from "@/core/shared/result/result";
import {
  FacturaRepository,
  FacturaEntity,
  FacturaAggregateRow,
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
// Concrete repos needed for transaction-scoped instances.
// Trade-off: coupling service to implementation for Prisma $transaction support
// without introducing a full Unit-of-Work abstraction.
import { PrismaFacturaRepository } from "../repositories/PrismaFacturaRepository.repository";
import { PrismaFacturaHistorialRepository } from "../repositories/PrismaFacturaHistorialRepository.repository";

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
    const validationResult = createFacturaSchema.safeParse(input);
    if (!validationResult.success) {
      return Err(new Error(validationResult.error.message));
    }

    const uuidExists = await this.facturaRepository.findByUuid(input.uuid);
    if (uuidExists) {
      return Err(new Error("Ya existe una factura con ese UUID"));
    }

    try {
      const factura = await this.prisma.$transaction(async (tx) => {
        // Create transaction-scoped repositories (static imports, no dynamic import anti-pattern).
        const txFacturaRepo = new PrismaFacturaRepository(tx);
        const txHistorialRepo = new PrismaFacturaHistorialRepository(tx);
        const txHistorialService = new FacturaHistorialService(txHistorialRepo);

        const newFactura = await txFacturaRepo.create({
          ...input,
          ingresadoPor: input.usuarioId || null,
        });

        await txHistorialService.createHistorialForNewFactura(
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
    const validationResult = updateFacturaSchema.safeParse(input);
    if (!validationResult.success) {
      return Err(new Error(validationResult.error.message));
    }

    const existing = await this.facturaRepository.findById({ id: input.id });
    if (!existing) {
      return Err(new Error("Factura no encontrada"));
    }

    if (input.uuid !== existing.uuid) {
      const uuidExists = await this.facturaRepository.findByUuid(input.uuid);
      if (uuidExists) {
        return Err(new Error("Ya existe una factura con ese UUID"));
      }
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const txFacturaRepo = new PrismaFacturaRepository(tx);
        const txHistorialRepo = new PrismaFacturaHistorialRepository(tx);
        const txHistorialService = new FacturaHistorialService(txHistorialRepo);

        const updatedFactura = await txFacturaRepo.update({ ...input });

        await txHistorialService.createHistorialForUpdate(
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

  async getPaginated(
    params: FacturasFilterParams
  ): Promise<Result<{ data: FacturaEntity[]; totalCount: number }, Error>> {
    try {
      const result = await this.facturaRepository.getPaginated(params);
      return Ok(result);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener facturas paginadas")
      );
    }
  }

  async getAggregates(
    params: Omit<FacturasFilterParams, "page" | "pageSize" | "sortBy" | "sortOrder">
  ): Promise<Result<FacturaAggregateRow[], Error>> {
    try {
      const rows = await this.facturaRepository.getAggregates(params);
      return Ok(rows);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al calcular agregados de facturas")
      );
    }
  }
}
