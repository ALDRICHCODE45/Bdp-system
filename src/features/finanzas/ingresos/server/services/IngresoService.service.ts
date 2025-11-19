import {
  IngresoRepository,
  IngresoEntity,
} from "../repositories/IngresoRepository.repository";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { PrismaClient } from "@prisma/client";

type CreateIngresoInput = {
  concepto: string;
  cliente: string;
  clienteId: string;
  solicitante: "RJS" | "RGZ" | "CALFC";
  autorizador: "RJS" | "RGZ" | "CALFC";
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
};

type UpdateIngresoInput = {
  id: string;
  concepto: string;
  cliente: string;
  clienteId: string;
  solicitante: "RJS" | "RGZ" | "CALFC";
  autorizador: "RJS" | "RGZ" | "CALFC";
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
};

export class IngresoService {
  constructor(
    private ingresoRepository: IngresoRepository,
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

      const ingreso = await this.ingresoRepository.create(input);

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

      // Si cambió el folio fiscal, validar que no exista
      if (input.folioFiscal !== existing.folioFiscal) {
        const folioExists = await this.ingresoRepository.findByFolioFiscal(
          input.folioFiscal
        );

        if (folioExists) {
          return Err(new Error("Ya existe un ingreso con ese folio fiscal"));
        }
      }

      const ingreso = await this.ingresoRepository.update(input);

      return Ok(ingreso);
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
}

