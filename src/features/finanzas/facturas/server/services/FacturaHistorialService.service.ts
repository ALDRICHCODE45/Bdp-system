import { FacturaHistorialRepository } from "../repositories/FacturaHistorialRepository.repository";
import { FacturaEntity } from "../repositories/FacturaRepository.repository";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { Prisma, FacturaHistorial } from "@prisma/client";

type FacturaData = {
  concepto: string;
  serie: string | null;
  folio: string | null;
  subtotal: Prisma.Decimal | number;
  totalImpuestosTransladados: Prisma.Decimal | number | null;
  totalImpuestosRetenidos: Prisma.Decimal | number | null;
  total: Prisma.Decimal | number;
  uuid: string;
  rfcEmisor: string;
  nombreReceptor: string | null;
  rfcReceptor: string;
  metodoPago: string | null;
  moneda: string;
  usoCfdi: string | null;
  status: string;
  nombreEmisor: string | null;
  statusPago: string | null;
  fechaPago: Date | null;
};

export class FacturaHistorialService {
  constructor(
    private historialRepository: FacturaHistorialRepository
  ) {}

  /**
   * Normaliza una fecha a formato yyyy-MM-dd (solo fecha, sin hora/timezone)
   * para evitar falsos positivos al comparar fechas que llegaron como string vs Date
   */
  private normalizeDateToString(value: Date | string): string {
    try {
      const d = value instanceof Date ? value : new Date(value);
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return String(value);
    }
  }

  /**
   * Formatea un valor a string para almacenamiento en el historial
   */
  private formatValue(value: unknown, campo?: string): string {
    if (value === null || value === undefined) {
      return "";
    }

    // Date — para fechaPago solo guardamos yyyy-MM-dd para evitar phantom diffs por timezone
    if (value instanceof Date) {
      if (campo === "fechaPago") {
        return this.normalizeDateToString(value);
      }
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
   * Extrae los datos relevantes de una entidad Factura
   */
  private extractFacturaData(factura: FacturaEntity): FacturaData {
    return {
      concepto: factura.concepto,
      serie: factura.serie,
      folio: factura.folio,
      subtotal: factura.subtotal,
      totalImpuestosTransladados: factura.totalImpuestosTransladados,
      totalImpuestosRetenidos: factura.totalImpuestosRetenidos,
      total: factura.total,
      uuid: factura.uuid,
      rfcEmisor: factura.rfcEmisor,
      nombreReceptor: factura.nombreReceptor,
      rfcReceptor: factura.rfcReceptor,
      metodoPago: factura.metodoPago,
      moneda: factura.moneda,
      usoCfdi: factura.usoCfdi,
      status: factura.status,
      nombreEmisor: factura.nombreEmisor,
      statusPago: factura.statusPago,
      fechaPago: factura.fechaPago,
    };
  }

  /**
   * Detecta cambios entre dos objetos de factura
   */
  private detectChanges(
    oldData: FacturaData,
    newData: FacturaData
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

    const fields: (keyof FacturaData)[] = [
      "concepto",
      "serie",
      "folio",
      "subtotal",
      "totalImpuestosTransladados",
      "totalImpuestosRetenidos",
      "total",
      "uuid",
      "rfcEmisor",
      "nombreReceptor",
      "rfcReceptor",
      "metodoPago",
      "moneda",
      "usoCfdi",
      "status",
      "nombreEmisor",
      "statusPago",
      "fechaPago",
    ];

    for (const field of fields) {
      const oldValue = oldData[field];
      const newValue = newData[field];

      // Comparar valores formateados (pasamos el campo para manejo especial de fechas)
      const oldFormatted = this.formatValue(oldValue, field);
      const newFormatted = this.formatValue(newValue, field);

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
   * Crea registros de historial para una factura recién creada
   */
  async createHistorialForNewFactura(
    factura: FacturaEntity,
    usuarioId?: string | null
  ): Promise<Result<void, Error>> {
    try {
      const facturaData = this.extractFacturaData(factura);

      // Crear registros de historial para todos los campos iniciales
      const historialRecords = Object.keys(facturaData).map((field) => ({
        facturaId: factura.id,
        campo: field,
        valorAnterior: null,
        valorNuevo: this.formatValue(
          facturaData[field as keyof FacturaData],
          field
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
          : new Error("Error al crear historial para nueva factura")
      );
    }
  }

  /**
   * Crea registros de historial para los cambios detectados en una actualización
   */
  async createHistorialForUpdate(
    oldFactura: FacturaEntity,
    newFactura: FacturaEntity,
    usuarioId?: string | null
  ): Promise<Result<void, Error>> {
    try {
      const oldData = this.extractFacturaData(oldFactura);
      const newData = this.extractFacturaData(newFactura);

      const changes = this.detectChanges(oldData, newData);

      if (changes.length === 0) {
        // No hay cambios, no crear registros de historial
        return Ok(undefined);
      }

      // Crear registros de historial solo para campos que cambiaron
      const historialRecords = changes.map((change) => ({
        facturaId: newFactura.id,
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
   * Obtiene el historial de cambios de una factura
   */
  async getHistorialByFacturaId(
    facturaId: string
  ): Promise<Result<FacturaHistorial[], Error>> {
    try {
      const historial = await this.historialRepository.findByFacturaId({
        facturaId,
      });

      return Ok(historial);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener historial de la factura")
      );
    }
  }
}
