import { EgresoHistorialRepository } from "../repositories/EgresoHistorialRepository.repository";
import { EgresoEntity } from "../repositories/EgresoRepository.repository";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { Prisma, EgresoHistorial } from "@prisma/client";

type EgresoData = {
  concepto: string;
  clasificacion: string;
  categoria: string;
  proveedor: string;
  proveedorId: string;
  solicitante: string;
  autorizador: string;
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
  clienteProyecto: string | null;
  clienteProyectoId: string | null;
  facturaId: string | null;
  notas: string | null;
};

export class EgresoHistorialService {
  constructor(private historialRepository: EgresoHistorialRepository) {}

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
   * Detecta cambios entre dos objetos de egreso
   */
  private detectChanges(
    oldData: EgresoData,
    newData: EgresoData
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

    const fields: (keyof EgresoData)[] = [
      "concepto",
      "clasificacion",
      "categoria",
      "proveedor",
      "proveedorId",
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
      "clienteProyectoId",
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
   * Crea registros de historial para un egreso recién creado
   */
  async createHistorialForNewEgreso(
    egreso: EgresoEntity,
    usuarioId?: string | null
  ): Promise<Result<void, Error>> {
    try {
      const egresoData: EgresoData = {
        concepto: egreso.concepto,
        clasificacion: egreso.clasificacion,
        categoria: egreso.categoria,
        proveedor: egreso.proveedor,
        proveedorId: egreso.proveedorId,
        solicitante: egreso.solicitante,
        autorizador: egreso.autorizador,
        numeroFactura: egreso.numeroFactura,
        folioFiscal: egreso.folioFiscal,
        periodo: egreso.periodo,
        formaPago: egreso.formaPago,
        origen: egreso.origen,
        numeroCuenta: egreso.numeroCuenta,
        clabe: egreso.clabe,
        cargoAbono: egreso.cargoAbono,
        cantidad: egreso.cantidad,
        estado: egreso.estado,
        fechaPago: egreso.fechaPago,
        fechaRegistro: egreso.fechaRegistro,
        facturadoPor: egreso.facturadoPor,
        clienteProyecto: egreso.clienteProyecto ?? null,
        clienteProyectoId: egreso.clienteProyectoId ?? null,
        facturaId: egreso.facturaId,
        notas: egreso.notas,
      };

      // Crear registros de historial para todos los campos iniciales
      const historialRecords = Object.keys(egresoData).map((field) => ({
        egresoId: egreso.id,
        campo: field,
        valorAnterior: null,
        valorNuevo: this.formatValue(egresoData[field as keyof EgresoData]),
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
          : new Error("Error al crear historial para nuevo egreso")
      );
    }
  }

  /**
   * Crea registros de historial para los cambios detectados en una actualización
   */
  async createHistorialForUpdate(
    oldEgreso: EgresoEntity,
    newEgreso: EgresoEntity,
    usuarioId?: string | null
  ): Promise<Result<void, Error>> {
    try {
      const oldData: EgresoData = {
        concepto: oldEgreso.concepto,
        clasificacion: oldEgreso.clasificacion,
        categoria: oldEgreso.categoria,
        proveedor: oldEgreso.proveedor,
        proveedorId: oldEgreso.proveedorId,
        solicitante: oldEgreso.solicitante,
        autorizador: oldEgreso.autorizador,
        numeroFactura: oldEgreso.numeroFactura,
        folioFiscal: oldEgreso.folioFiscal,
        periodo: oldEgreso.periodo,
        formaPago: oldEgreso.formaPago,
        origen: oldEgreso.origen,
        numeroCuenta: oldEgreso.numeroCuenta,
        clabe: oldEgreso.clabe,
        cargoAbono: oldEgreso.cargoAbono,
        cantidad: oldEgreso.cantidad,
        estado: oldEgreso.estado,
        fechaPago: oldEgreso.fechaPago,
        fechaRegistro: oldEgreso.fechaRegistro,
        facturadoPor: oldEgreso.facturadoPor,
        clienteProyecto: oldEgreso.clienteProyecto ?? null,
        clienteProyectoId: oldEgreso.clienteProyectoId ?? null,
        facturaId: oldEgreso.facturaId,
        notas: oldEgreso.notas,
      };

      const newData: EgresoData = {
        concepto: newEgreso.concepto,
        clasificacion: newEgreso.clasificacion,
        categoria: newEgreso.categoria,
        proveedor: newEgreso.proveedor,
        proveedorId: newEgreso.proveedorId,
        solicitante: newEgreso.solicitante,
        autorizador: newEgreso.autorizador,
        numeroFactura: newEgreso.numeroFactura,
        folioFiscal: newEgreso.folioFiscal,
        periodo: newEgreso.periodo,
        formaPago: newEgreso.formaPago,
        origen: newEgreso.origen,
        numeroCuenta: newEgreso.numeroCuenta,
        clabe: newEgreso.clabe,
        cargoAbono: newEgreso.cargoAbono,
        cantidad: newEgreso.cantidad,
        estado: newEgreso.estado,
        fechaPago: newEgreso.fechaPago,
        fechaRegistro: newEgreso.fechaRegistro,
        facturadoPor: newEgreso.facturadoPor,
        clienteProyecto: newEgreso.clienteProyecto ?? null,
        clienteProyectoId: newEgreso.clienteProyectoId ?? null,
        facturaId: newEgreso.facturaId,
        notas: newEgreso.notas,
      };

      const changes = this.detectChanges(oldData, newData);

      if (changes.length === 0) {
        // No hay cambios, no crear registros de historial
        return Ok(undefined);
      }

      // Crear registros de historial solo para campos que cambiaron
      const historialRecords = changes.map((change) => ({
        egresoId: newEgreso.id,
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
   * Obtiene el historial de cambios de un egreso
   */
  async getHistorialByEgresoId(
    egresoId: string
  ): Promise<Result<EgresoHistorial[], Error>> {
    try {
      const historial = await this.historialRepository.findByEgresoId({
        egresoId,
      });

      return Ok(historial);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener historial del egreso")
      );
    }
  }
}
