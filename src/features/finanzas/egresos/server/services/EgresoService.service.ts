import {
  EgresoRepository,
  EgresoEntity,
} from "../repositories/EgresoRepository.repository";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { PrismaClient } from "@prisma/client";
import { EgresoHistorialService } from "./EgresoHistorialService.service";

type CreateEgresoInput = {
  concepto: string;
  clasificacion:
    | "GASTO_OP"
    | "HONORARIOS"
    | "SERVICIOS"
    | "ARRENDAMIENTO"
    | "COMISIONES"
    | "DISPOSICION";
  categoria: "FACTURACION" | "COMISIONES" | "DISPOSICION" | "BANCARIZACIONES";
  proveedor: string;
  proveedorId: string;
  solicitante: string;
  solicitanteId: string;
  autorizador: string;
  autorizadorId: string;
  numeroFactura: string;
  folioFiscal: string;
  periodo: string;
  formaPago: "TRANSFERENCIA" | "EFECTIVO" | "CHEQUE";
  origen: string;
  numeroCuenta: string;
  clabe: string;
  cargoAbono: "BDP" | "CALFC" | "GLOBAL" | "RJZ" | "APP";
  cantidad: number;
  estado: "PAGADO" | "PENDIENTE" | "CANCELADO";
  fechaPago?: Date | null;
  fechaRegistro: Date;
  facturadoPor: "BDP" | "CALFC" | "GLOBAL" | "RGZ" | "RJS" | "APP";
  clienteProyecto: string | null;
  clienteProyectoId: string | null;
  notas?: string | null;
  ingresadoPor?: string | null;
  usuarioId?: string | null;
};

type UpdateEgresoInput = {
  id: string;
  concepto: string;
  clasificacion:
    | "GASTO_OP"
    | "HONORARIOS"
    | "SERVICIOS"
    | "ARRENDAMIENTO"
    | "COMISIONES"
    | "DISPOSICION";
  categoria: "FACTURACION" | "COMISIONES" | "DISPOSICION" | "BANCARIZACIONES";
  proveedor: string;
  proveedorId: string;
  solicitante: string;
  solicitanteId: string;
  autorizador: string;
  autorizadorId: string;
  numeroFactura: string;
  folioFiscal: string;
  periodo: string;
  formaPago: "TRANSFERENCIA" | "EFECTIVO" | "CHEQUE";
  origen: string;
  numeroCuenta: string;
  clabe: string;
  cargoAbono: "BDP" | "CALFC" | "GLOBAL" | "RJZ" | "APP";
  cantidad: number;
  estado: "PAGADO" | "PENDIENTE" | "CANCELADO";
  fechaPago?: Date | null;
  fechaRegistro: Date;
  facturadoPor: "BDP" | "CALFC" | "GLOBAL" | "RGZ" | "RJS" | "APP";
  clienteProyecto: string | null;
  clienteProyectoId: string | null;
  notas?: string | null;
  usuarioId?: string | null;
};

export class EgresoService {
  constructor(
    private egresoRepository: EgresoRepository,
    private historialService: EgresoHistorialService,
    private prisma: PrismaClient
  ) {}

  async create(input: CreateEgresoInput): Promise<Result<EgresoEntity, Error>> {
    try {
      // Validar que el folio fiscal no exista
      const folioExists = await this.egresoRepository.findByFolioFiscal(
        input.folioFiscal
      );

      if (folioExists) {
        return Err(new Error("Ya existe un egreso con ese folio fiscal"));
      }

      // Verificar que el proveedor existe y es de tipo PROVEEDOR
      const proveedor = await this.prisma.clienteProveedor.findUnique({
        where: { id: input.proveedorId },
      });

      if (!proveedor) {
        return Err(new Error("El proveedor no existe"));
      }

      if (proveedor.tipo !== "PROVEEDOR") {
        return Err(
          new Error(
            "El cliente/proveedor seleccionado no es de tipo PROVEEDOR"
          )
        );
      }

      // Verificar que el cliente/proyecto existe cuando se proporcione
      if (input.clienteProyectoId) {
        const clienteProyecto = await this.prisma.clienteProveedor.findUnique({
          where: { id: input.clienteProyectoId },
        });

        if (!clienteProyecto) {
          return Err(new Error("El cliente/proyecto no existe"));
        }
      }

      // Validar solicitante
      const solicitante = await this.prisma.socio.findUnique({
        where: { id: input.solicitanteId },
      });
      if (!solicitante) {
        return Err(new Error("El solicitante no existe"));
      }

      // Validar autorizador
      const autorizador = await this.prisma.socio.findUnique({
        where: { id: input.autorizadorId },
      });
      if (!autorizador) {
        return Err(new Error("El autorizador no existe"));
      }

      const egreso = await this.egresoRepository.create({
        ...input,
        clienteProyecto: input.clienteProyecto ?? null,
        clienteProyectoId: input.clienteProyectoId ?? null,
        ingresadoPor: input.usuarioId || null,
      });

      // Crear historial para el nuevo egreso
      const historialResult =
        await this.historialService.createHistorialForNewEgreso(
          egreso,
          input.usuarioId
        );

      if (!historialResult.ok) {
        // Si falla la creación del historial, no fallar la creación del egreso
        // pero registrar el error
        console.error(
          "Error al crear historial para nuevo egreso:",
          historialResult.error
        );
      }

      return Ok(egreso);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al crear egreso")
      );
    }
  }

  async update(input: UpdateEgresoInput): Promise<Result<EgresoEntity, Error>> {
    try {
      // Verificar que el egreso existe
      const existing = await this.egresoRepository.findById({
        id: input.id,
      });

      if (!existing) {
        return Err(new Error("Egreso no encontrado"));
      }

      // Verificar que el proveedor existe y es de tipo PROVEEDOR
      const proveedor = await this.prisma.clienteProveedor.findUnique({
        where: { id: input.proveedorId },
      });

      if (!proveedor) {
        return Err(new Error("El proveedor no existe"));
      }

      if (proveedor.tipo !== "PROVEEDOR") {
        return Err(
          new Error(
            "El cliente/proveedor seleccionado no es de tipo PROVEEDOR"
          )
        );
      }

      // Verificar que el cliente/proyecto existe cuando se proporcione
      if (input.clienteProyectoId) {
        const clienteProyecto = await this.prisma.clienteProveedor.findUnique({
          where: { id: input.clienteProyectoId },
        });

        if (!clienteProyecto) {
          return Err(new Error("El cliente/proyecto no existe"));
        }
      }

      // Validar solicitante
      const solicitante = await this.prisma.socio.findUnique({
        where: { id: input.solicitanteId },
      });
      if (!solicitante) {
        return Err(new Error("El solicitante no existe"));
      }

      // Validar autorizador
      const autorizador = await this.prisma.socio.findUnique({
        where: { id: input.autorizadorId },
      });
      if (!autorizador) {
        return Err(new Error("El autorizador no existe"));
      }

      // Si cambió el folio fiscal, validar que no exista
      if (input.folioFiscal !== existing.folioFiscal) {
        const folioExists = await this.egresoRepository.findByFolioFiscal(
          input.folioFiscal
        );

        if (folioExists) {
          return Err(new Error("Ya existe un egreso con ese folio fiscal"));
        }
      }

      // Usar transacción para actualizar egreso y crear historial de forma atómica
      const result = await this.prisma.$transaction(async (tx) => {
        // Crear repositorio temporal con el cliente de transacción
        const { PrismaEgresoRepository } = await import(
          "../repositories/PrismaEgresoRepository.repository"
        );
        const { PrismaEgresoHistorialRepository } = await import(
          "../repositories/PrismaEgresoHistorialRepository.repository"
        );
        const { EgresoHistorialService } = await import(
          "./EgresoHistorialService.service"
        );

        const tempEgresoRepository = new PrismaEgresoRepository(tx);
        const tempHistorialRepository =
          new PrismaEgresoHistorialRepository(tx);
        const tempHistorialService = new EgresoHistorialService(
          tempHistorialRepository
        );

        // Actualizar egreso
        const updatedEgreso = await tempEgresoRepository.update({
          ...input,
          clienteProyecto: input.clienteProyecto ?? null,
          clienteProyectoId: input.clienteProyectoId ?? null,
        });

        // Crear historial para los cambios
        const historialResult =
          await tempHistorialService.createHistorialForUpdate(
            existing,
            updatedEgreso,
            input.usuarioId
          );

        if (!historialResult.ok) {
          throw new Error(
            `Error al crear historial: ${historialResult.error.message}`
          );
        }

        return updatedEgreso;
      });

      return Ok(result);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al actualizar egreso")
      );
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      // Verificar que el egreso existe
      const existing = await this.egresoRepository.findById({ id });

      if (!existing) {
        return Err(new Error("Egreso no encontrado"));
      }

      await this.egresoRepository.delete({ id });

      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al eliminar egreso")
      );
    }
  }

  async getById(id: string): Promise<Result<EgresoEntity, Error>> {
    try {
      const egreso = await this.egresoRepository.findById({ id });

      if (!egreso) {
        return Err(new Error("Egreso no encontrado"));
      }

      return Ok(egreso);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al obtener egreso")
      );
    }
  }

  async getAll(): Promise<Result<EgresoEntity[], Error>> {
    try {
      const egresos = await this.egresoRepository.getAll();
      return Ok(egresos);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al obtener egresos")
      );
    }
  }
}

