import {
  IngresoRepository,
  IngresoEntity,
} from "../repositories/IngresoRepository.repository";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { PrismaClient } from "@prisma/client";
import { IngresoHistorialService } from "./IngresoHistorialService.service";

type CreateIngresoInput = {
  concepto: string;
  cliente: string;
  clienteId: string;
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
  cargoAbono: "BDP" | "CALFC";
  cantidad: number;
  estado: "PAGADO" | "PENDIENTE" | "CANCELADO";
  fechaPago?: Date | null;
  fechaRegistro: Date;
  facturadoPor: "BDP" | "CALFC" | "GLOBAL" | "RGZ" | "RJS" | "APP";
  clienteProyecto: string;
  fechaParticipacion?: Date | null;
  notas?: string | null;
  ingresadoPor?: string | null;
  usuarioId?: string | null;
};

type UpdateIngresoInput = {
  id: string;
  concepto: string;
  cliente: string;
  clienteId: string;
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
  cargoAbono: "BDP" | "CALFC";
  cantidad: number;
  estado: "PAGADO" | "PENDIENTE" | "CANCELADO";
  fechaPago?: Date | null;
  fechaRegistro: Date;
  facturadoPor: "BDP" | "CALFC" | "GLOBAL" | "RGZ" | "RJS" | "APP";
  clienteProyecto: string;
  fechaParticipacion?: Date | null;
  facturaId?: string | null;
  notas?: string | null;
  usuarioId?: string | null;
};

export class IngresoService {
  constructor(
    private ingresoRepository: IngresoRepository,
    private historialService: IngresoHistorialService,
    private prisma: PrismaClient
  ) {}

  async create(input: CreateIngresoInput): Promise<Result<IngresoEntity, Error>> {
    try {
      // Validar que el folio fiscal no exista
      const folioExists = await this.ingresoRepository.findByFolioFiscal(
        input.folioFiscal
      );

      if (folioExists) {
        return Err(new Error("Ya existe un ingreso con ese folio fiscal"));
      }

      // Verificar que el cliente existe y es de tipo CLIENTE
      const cliente = await this.prisma.clienteProveedor.findUnique({
        where: { id: input.clienteId },
      });

      if (!cliente) {
        return Err(new Error("El cliente no existe"));
      }

      if (cliente.tipo !== "CLIENTE") {
        return Err(
          new Error(
            "El cliente/proveedor seleccionado no es de tipo CLIENTE"
          )
        );
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

      const ingreso = await this.ingresoRepository.create({
        ...input,
        ingresadoPor: input.usuarioId || null,
      });

      // Crear historial para el nuevo ingreso
      const historialResult =
        await this.historialService.createHistorialForNewIngreso(
          ingreso,
          input.usuarioId
        );

      if (!historialResult.ok) {
        // Si falla la creación del historial, no fallar la creación del ingreso
        // pero registrar el error
        console.error(
          "Error al crear historial para nuevo ingreso:",
          historialResult.error
        );
      }

      return Ok(ingreso);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al crear ingreso")
      );
    }
  }

  async update(input: UpdateIngresoInput): Promise<Result<IngresoEntity, Error>> {
    try {
      // Verificar que el ingreso existe
      const existing = await this.ingresoRepository.findById({
        id: input.id,
      });

      if (!existing) {
        return Err(new Error("Ingreso no encontrado"));
      }

      // Verificar que el cliente existe y es de tipo CLIENTE
      const cliente = await this.prisma.clienteProveedor.findUnique({
        where: { id: input.clienteId },
      });

      if (!cliente) {
        return Err(new Error("El cliente no existe"));
      }

      if (cliente.tipo !== "CLIENTE") {
        return Err(
          new Error(
            "El cliente/proveedor seleccionado no es de tipo CLIENTE"
          )
        );
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
        const folioExists = await this.ingresoRepository.findByFolioFiscal(
          input.folioFiscal
        );

        if (folioExists) {
          return Err(new Error("Ya existe un ingreso con ese folio fiscal"));
        }
      }

      // Usar transacción para actualizar ingreso y crear historial de forma atómica
      const result = await this.prisma.$transaction(async (tx) => {
        // Crear repositorio temporal con el cliente de transacción
        const { PrismaIngresoRepository } = await import(
          "../repositories/PrismaIngresoRepository.repository"
        );
        const { PrismaIngresoHistorialRepository } = await import(
          "../repositories/PrismaIngresoHistorialRepository.repository"
        );
        const { IngresoHistorialService } = await import(
          "./IngresoHistorialService.service"
        );

        const tempIngresoRepository = new PrismaIngresoRepository(tx);
        const tempHistorialRepository =
          new PrismaIngresoHistorialRepository(tx);
        const tempHistorialService = new IngresoHistorialService(
          tempHistorialRepository
        );

        // Actualizar ingreso
        const updatedIngreso = await tempIngresoRepository.update(input);

        // Crear historial para los cambios
        const historialResult =
          await tempHistorialService.createHistorialForUpdate(
            existing,
            updatedIngreso,
            input.usuarioId
          );

        if (!historialResult.ok) {
          // Si falla la creación del historial, hacer rollback de la transacción
          throw historialResult.error;
        }

        return updatedIngreso;
      });

      return Ok(result);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al actualizar ingreso")
      );
    }
  }

  async delete(id: string): Promise<Result<void, Error>> {
    try {
      // Verificar que el ingreso existe
      const existing = await this.ingresoRepository.findById({ id });

      if (!existing) {
        return Err(new Error("Ingreso no encontrado"));
      }

      await this.ingresoRepository.delete({ id });

      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al eliminar ingreso")
      );
    }
  }

  async getById(id: string): Promise<Result<IngresoEntity, Error>> {
    try {
      const ingreso = await this.ingresoRepository.findById({ id });

      if (!ingreso) {
        return Err(new Error("Ingreso no encontrado"));
      }

      return Ok(ingreso);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al obtener ingreso")
      );
    }
  }

  async getAll(): Promise<Result<IngresoEntity[], Error>> {
    try {
      const ingresos = await this.ingresoRepository.getAll();
      return Ok(ingresos);
    } catch (error) {
      return Err(
        error instanceof Error ? error : new Error("Error al obtener ingresos")
      );
    }
  }

  async getPaginated(params: import("@/core/shared/types/pagination.types").PaginationParams): Promise<Result<{ data: IngresoEntity[]; totalCount: number }, Error>> {
    try {
      const result = await this.ingresoRepository.getPaginated(params);
      return Ok(result);
    } catch (error) {
      return Err(error instanceof Error ? error : new Error("Error al obtener ingresos paginados"));
    }
  }
}

