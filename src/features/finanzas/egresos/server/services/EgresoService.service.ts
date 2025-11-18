import {
  EgresoRepository,
  EgresoEntity,
} from "../repositories/EgresoRepository.repository";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { PrismaClient } from "@prisma/client";

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
  solicitante: "RJS" | "RGZ" | "CALFC";
  autorizador: "RJS" | "RGZ" | "CALFC";
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
  clienteProyecto: string;
  clienteProyectoId: string;
  notas?: string | null;
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
  solicitante: "RJS" | "RGZ" | "CALFC";
  autorizador: "RJS" | "RGZ" | "CALFC";
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
  clienteProyecto: string;
  clienteProyectoId: string;
  notas?: string | null;
};

export class EgresoService {
  constructor(
    private egresoRepository: EgresoRepository,
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

      // Verificar que el cliente/proyecto existe
      const clienteProyecto = await this.prisma.clienteProveedor.findUnique({
        where: { id: input.clienteProyectoId },
      });

      if (!clienteProyecto) {
        return Err(new Error("El cliente/proyecto no existe"));
      }

      const egreso = await this.egresoRepository.create(input);

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

      // Verificar que el cliente/proyecto existe
      const clienteProyecto = await this.prisma.clienteProveedor.findUnique({
        where: { id: input.clienteProyectoId },
      });

      if (!clienteProyecto) {
        return Err(new Error("El cliente/proyecto no existe"));
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

      const egreso = await this.egresoRepository.update(input);

      return Ok(egreso);
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

