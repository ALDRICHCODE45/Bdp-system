import { FacturaHistorialRepository } from "../repositories/FacturaHistorialRepository.repository";
import { FacturaEntity } from "../repositories/FacturaRepository.repository";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { Prisma, FacturaHistorial } from "@prisma/client";

type FacturaData = {
  tipoOrigen: string;
  origenId: string;
  clienteProveedorId: string;
  clienteProveedor: string;
  concepto: string;
  monto: Prisma.Decimal | number;
  periodo: string;
  numeroFactura: string;
  folioFiscal: string;
  fechaEmision: Date;
  fechaVencimiento: Date;
  estado: string;
  formaPago: string;
  rfcEmisor: string;
  rfcReceptor: string;
  direccionEmisor: string;
  direccionReceptor: string;
  fechaPago: Date | null;
  fechaRegistro: Date;
  creadoPor: string;
  autorizadoPor: string;
  notas: string | null;
  archivoPdf: string | null;
  archivoXml: string | null;
};

export class FacturaHistorialService {
  constructor(
    private historialRepository: FacturaHistorialRepository
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
      "tipoOrigen",
      "origenId",
      "clienteProveedorId",
      "clienteProveedor",
      "concepto",
      "monto",
      "periodo",
      "numeroFactura",
      "folioFiscal",
      "fechaEmision",
      "fechaVencimiento",
      "estado",
      "formaPago",
      "rfcEmisor",
      "rfcReceptor",
      "direccionEmisor",
      "direccionReceptor",
      "fechaPago",
      "fechaRegistro",
      "creadoPor",
      "autorizadoPor",
      "notas",
      "archivoPdf",
      "archivoXml",
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
   * Crea registros de historial para una factura recién creada
   */
  async createHistorialForNewFactura(
    factura: FacturaEntity,
    usuarioId?: string | null
  ): Promise<Result<void, Error>> {
    try {
      const facturaData: FacturaData = {
        tipoOrigen: factura.tipoOrigen,
        origenId: factura.origenId,
        clienteProveedorId: factura.clienteProveedorId,
        clienteProveedor: factura.clienteProveedor,
        concepto: factura.concepto,
        monto: factura.monto,
        periodo: factura.periodo,
        numeroFactura: factura.numeroFactura,
        folioFiscal: factura.folioFiscal,
        fechaEmision: factura.fechaEmision,
        fechaVencimiento: factura.fechaVencimiento,
        estado: factura.estado,
        formaPago: factura.formaPago,
        rfcEmisor: factura.rfcEmisor,
        rfcReceptor: factura.rfcReceptor,
        direccionEmisor: factura.direccionEmisor,
        direccionReceptor: factura.direccionReceptor,
        fechaPago: factura.fechaPago,
        fechaRegistro: factura.fechaRegistro,
        creadoPor: factura.creadoPor,
        autorizadoPor: factura.autorizadoPor,
        notas: factura.notas,
        archivoPdf: factura.archivoPdf,
        archivoXml: factura.archivoXml,
      };

      // Crear registros de historial para todos los campos iniciales
      const historialRecords = Object.keys(facturaData).map((field) => ({
        facturaId: factura.id,
        campo: field,
        valorAnterior: null,
        valorNuevo: this.formatValue(
          facturaData[field as keyof FacturaData]
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
      const oldData: FacturaData = {
        tipoOrigen: oldFactura.tipoOrigen,
        origenId: oldFactura.origenId,
        clienteProveedorId: oldFactura.clienteProveedorId,
        clienteProveedor: oldFactura.clienteProveedor,
        concepto: oldFactura.concepto,
        monto: oldFactura.monto,
        periodo: oldFactura.periodo,
        numeroFactura: oldFactura.numeroFactura,
        folioFiscal: oldFactura.folioFiscal,
        fechaEmision: oldFactura.fechaEmision,
        fechaVencimiento: oldFactura.fechaVencimiento,
        estado: oldFactura.estado,
        formaPago: oldFactura.formaPago,
        rfcEmisor: oldFactura.rfcEmisor,
        rfcReceptor: oldFactura.rfcReceptor,
        direccionEmisor: oldFactura.direccionEmisor,
        direccionReceptor: oldFactura.direccionReceptor,
        fechaPago: oldFactura.fechaPago,
        fechaRegistro: oldFactura.fechaRegistro,
        creadoPor: oldFactura.creadoPor,
        autorizadoPor: oldFactura.autorizadoPor,
        notas: oldFactura.notas,
        archivoPdf: oldFactura.archivoPdf,
        archivoXml: oldFactura.archivoXml,
      };

      const newData: FacturaData = {
        tipoOrigen: newFactura.tipoOrigen,
        origenId: newFactura.origenId,
        clienteProveedorId: newFactura.clienteProveedorId,
        clienteProveedor: newFactura.clienteProveedor,
        concepto: newFactura.concepto,
        monto: newFactura.monto,
        periodo: newFactura.periodo,
        numeroFactura: newFactura.numeroFactura,
        folioFiscal: newFactura.folioFiscal,
        fechaEmision: newFactura.fechaEmision,
        fechaVencimiento: newFactura.fechaVencimiento,
        estado: newFactura.estado,
        formaPago: newFactura.formaPago,
        rfcEmisor: newFactura.rfcEmisor,
        rfcReceptor: newFactura.rfcReceptor,
        direccionEmisor: newFactura.direccionEmisor,
        direccionReceptor: newFactura.direccionReceptor,
        fechaPago: newFactura.fechaPago,
        fechaRegistro: newFactura.fechaRegistro,
        creadoPor: newFactura.creadoPor,
        autorizadoPor: newFactura.autorizadoPor,
        notas: newFactura.notas,
        archivoPdf: newFactura.archivoPdf,
        archivoXml: newFactura.archivoXml,
      };

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

