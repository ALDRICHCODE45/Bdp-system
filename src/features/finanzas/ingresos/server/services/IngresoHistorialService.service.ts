import { IngresoHistorialRepository } from "../repositories/IngresoHistorialRepository.repository";
import { IngresoEntity } from "../repositories/IngresoRepository.repository";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { Prisma, IngresoHistorial } from "@prisma/client";

type IngresoData = {
  concepto: string;
  cliente: string;
  clienteId: string;
  solicitante: string | null;
  autorizador: string | null;
  numeroFactura: string;
  folioFiscal: string;
  periodo: string;
  formaPago: string;
  origen: string;
  numeroCuenta: string;
  clabe: string;
  cargoAbono: string;
  cantidad: Prisma.Decimal | number;
  estado: string;
  fechaPago: Date | null;
  fechaRegistro: Date;
  facturadoPor: string;
  clienteProyecto: string;
  fechaParticipacion: Date | null;
  facturaId: string | null;
  notas: string | null;
};

export class IngresoHistorialService {
  constructor(
    private historialRepository: IngresoHistorialRepository
  ) {}

  /**
   * Formatea un valor a string para almacenamiento en el historial
   */
  private formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return "";
    }

    // Date
    if (value instanceof Date) {
      return value.toISOString();
    }

    // Decimal de Prisma
    if (value instanceof Prisma.Decimal) {
      return value.toString();
    }

    // Arrays
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }

    // Boolean
    if (typeof value === "boolean") {
      return value.toString();
    }

    // Números
    if (typeof value === "number") {
      return value.toString();
    }

    // Strings y otros
    return String(value);
  }

  /**
   * Detecta cambios entre dos objetos de ingreso
   */
  private detectChanges(
    oldData: IngresoData,
    newData: IngresoData
  ): Array<{
    campo: string;
    valorAnterior: string | null;
    valorNuevo: string;
  }> {
    const changes: Array<{
      campo: string;
      valorAnterior: string | null;
      valorNuevo: string;
    }> = [];

    const fields: (keyof IngresoData)[] = [
      "concepto",
      "cliente",
      "clienteId",
      "solicitante",
      "autorizador",
      "numeroFactura",
      "folioFiscal",
      "periodo",
      "formaPago",
      "origen",
      "numeroCuenta",
      "clabe",
      "cargoAbono",
      "cantidad",
      "estado",
      "fechaPago",
      "fechaRegistro",
      "facturadoPor",
      "clienteProyecto",
      "fechaParticipacion",
      "facturaId",
      "notas",
    ];

    for (const field of fields) {
      const oldValue = oldData[field];
      const newValue = newData[field];

      // Comparar valores formateados
      const oldFormatted = this.formatValue(oldValue);
      const newFormatted = this.formatValue(newValue);

      if (oldFormatted !== newFormatted) {
        changes.push({
          campo: field,
          valorAnterior: oldFormatted || null,
          valorNuevo: newFormatted,
        });
      }
    }

    return changes;
  }

  /**
   * Crea registros de historial para un ingreso recién creado
   */
  async createHistorialForNewIngreso(
    ingreso: IngresoEntity,
    usuarioId?: string | null
  ): Promise<Result<void, Error>> {
    try {
      const ingresoData: IngresoData = {
        concepto: ingreso.concepto,
        cliente: ingreso.cliente,
        clienteId: ingreso.clienteId,
        solicitante: ingreso.solicitanteRef?.nombre ?? null,
        autorizador: ingreso.autorizadorRef?.nombre ?? null,
        numeroFactura: ingreso.numeroFactura,
        folioFiscal: ingreso.folioFiscal,
        periodo: ingreso.periodo,
        formaPago: ingreso.formaPago,
        origen: ingreso.origen,
        numeroCuenta: ingreso.numeroCuenta,
        clabe: ingreso.clabe,
        cargoAbono: ingreso.cargoAbono,
        cantidad: ingreso.cantidad,
        estado: ingreso.estado,
        fechaPago: ingreso.fechaPago,
        fechaRegistro: ingreso.fechaRegistro,
        facturadoPor: ingreso.facturadoPor,
        clienteProyecto: ingreso.clienteProyecto,
        fechaParticipacion: ingreso.fechaParticipacion,
        facturaId: ingreso.facturaId,
        notas: ingreso.notas,
      };

      // Crear registros de historial para todos los campos iniciales
      const historialRecords = Object.keys(ingresoData).map((field) => ({
        ingresoId: ingreso.id,
        campo: field,
        valorAnterior: null,
        valorNuevo: this.formatValue(
          ingresoData[field as keyof IngresoData]
        ),
        usuarioId: usuarioId || null,
        motivo: null,
      }));

      if (historialRecords.length > 0) {
        await this.historialRepository.createMany(historialRecords);
      }

      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al crear historial para nuevo ingreso")
      );
    }
  }

  /**
   * Crea registros de historial para los cambios detectados en una actualización
   */
  async createHistorialForUpdate(
    oldIngreso: IngresoEntity,
    newIngreso: IngresoEntity,
    usuarioId?: string | null
  ): Promise<Result<void, Error>> {
    try {
      const oldData: IngresoData = {
        concepto: oldIngreso.concepto,
        cliente: oldIngreso.cliente,
        clienteId: oldIngreso.clienteId,
        solicitante: oldIngreso.solicitanteRef?.nombre ?? null,
        autorizador: oldIngreso.autorizadorRef?.nombre ?? null,
        numeroFactura: oldIngreso.numeroFactura,
        folioFiscal: oldIngreso.folioFiscal,
        periodo: oldIngreso.periodo,
        formaPago: oldIngreso.formaPago,
        origen: oldIngreso.origen,
        numeroCuenta: oldIngreso.numeroCuenta,
        clabe: oldIngreso.clabe,
        cargoAbono: oldIngreso.cargoAbono,
        cantidad: oldIngreso.cantidad,
        estado: oldIngreso.estado,
        fechaPago: oldIngreso.fechaPago,
        fechaRegistro: oldIngreso.fechaRegistro,
        facturadoPor: oldIngreso.facturadoPor,
        clienteProyecto: oldIngreso.clienteProyecto,
        fechaParticipacion: oldIngreso.fechaParticipacion,
        facturaId: oldIngreso.facturaId,
        notas: oldIngreso.notas,
      };

      const newData: IngresoData = {
        concepto: newIngreso.concepto,
        cliente: newIngreso.cliente,
        clienteId: newIngreso.clienteId,
        solicitante: newIngreso.solicitanteRef?.nombre ?? null,
        autorizador: newIngreso.autorizadorRef?.nombre ?? null,
        numeroFactura: newIngreso.numeroFactura,
        folioFiscal: newIngreso.folioFiscal,
        periodo: newIngreso.periodo,
        formaPago: newIngreso.formaPago,
        origen: newIngreso.origen,
        numeroCuenta: newIngreso.numeroCuenta,
        clabe: newIngreso.clabe,
        cargoAbono: newIngreso.cargoAbono,
        cantidad: newIngreso.cantidad,
        estado: newIngreso.estado,
        fechaPago: newIngreso.fechaPago,
        fechaRegistro: newIngreso.fechaRegistro,
        facturadoPor: newIngreso.facturadoPor,
        clienteProyecto: newIngreso.clienteProyecto,
        fechaParticipacion: newIngreso.fechaParticipacion,
        facturaId: newIngreso.facturaId,
        notas: newIngreso.notas,
      };

      const changes = this.detectChanges(oldData, newData);

      if (changes.length === 0) {
        // No hay cambios, no crear registros de historial
        return Ok(undefined);
      }

      // Crear registros de historial solo para campos que cambiaron
      const historialRecords = changes.map((change) => ({
        ingresoId: newIngreso.id,
        campo: change.campo,
        valorAnterior: change.valorAnterior,
        valorNuevo: change.valorNuevo,
        usuarioId: usuarioId || null,
        motivo: null,
      }));

      await this.historialRepository.createMany(historialRecords);

      return Ok(undefined);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al crear historial para actualización")
      );
    }
  }

  /**
   * Obtiene el historial de cambios de un ingreso
   */
  async getHistorialByIngresoId(
    ingresoId: string
  ): Promise<Result<IngresoHistorial[], Error>> {
    try {
      const historial = await this.historialRepository.findByIngresoId({
        ingresoId,
      });

      return Ok(historial);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener historial del ingreso")
      );
    }
  }
}

