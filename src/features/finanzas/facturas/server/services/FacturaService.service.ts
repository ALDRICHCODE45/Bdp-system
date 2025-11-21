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

    // 1. Validar folio fiscal único
    const folioExists = await this.facturaRepository.findByFolioFiscal(
      input.folioFiscal
    );
    if (folioExists) {
      return Err(new Error("Ya existe una factura con ese folio fiscal"));
    }

    // 2. Validar que el origen existe (Ingreso o Egreso)
    if (input.tipoOrigen === "INGRESO") {
      const ingreso = await this.prisma.ingreso.findUnique({
        where: { id: input.origenId },
      });
      if (!ingreso) {
        return Err(new Error("El ingreso especificado no existe"));
      }
    } else {
      const egreso = await this.prisma.egreso.findUnique({
        where: { id: input.origenId },
      });
      if (!egreso) {
        return Err(new Error("El egreso especificado no existe"));
      }
    }

    // 3. Validar que clienteProveedor existe
    const clienteProveedor = await this.prisma.clienteProveedor.findUnique({
      where: { id: input.clienteProveedorId },
    });
    if (!clienteProveedor) {
      return Err(new Error("El cliente/proveedor no existe"));
    }

    // 4. Crear factura con historial usando transacción
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

        const newFactura = await tempFacturaRepository.create(input);

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

    // Solo permitir editar si está en BORRADOR
    // if (existing.estado !== "BORRADOR") {
    //   return Err(
    //     new Error("Solo se pueden editar facturas en estado BORRADOR")
    //   );
    // }

    // Validar folio fiscal si cambió
    if (input.folioFiscal !== existing.folioFiscal) {
      const folioExists = await this.facturaRepository.findByFolioFiscal(
        input.folioFiscal
      );
      if (folioExists) {
        return Err(new Error("Ya existe una factura con ese folio fiscal"));
      }
    }

    try {
      // Usar transacción para actualizar factura y crear historial de forma atómica
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

        const updatedFactura = await tempFacturaRepository.update(input);

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

    // Solo permitir eliminar si está en BORRADOR
    if (existing.estado !== "BORRADOR") {
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

  async getByOrigenId(
    origenId: string
  ): Promise<Result<FacturaEntity[], Error>> {
    try {
      const facturas = await this.facturaRepository.findByOrigenId(origenId);
      return Ok(facturas);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener las facturas por origen")
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
}
