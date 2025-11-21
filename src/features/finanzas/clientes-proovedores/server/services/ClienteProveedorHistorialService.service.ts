import { ClienteProveedorHistorialRepository } from "../repositories/ClienteProveedorHistorialRepository.repository";
import { ClienteProveedorEntity } from "../repositories/ClienteProveedorRepository.repository";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { Prisma, ClienteProveedorHistorial } from "@prisma/client";

type ClienteProveedorData = {
  nombre: string;
  rfc: string;
  tipo: string;
  direccion: string;
  telefono: string;
  email: string;
  contacto: string;
  numeroCuenta: string | null;
  clabe: string | null;
  banco: string | null;
  activo: boolean;
  fechaRegistro: Date;
  notas: string | null;
  socioId: string | null;
};

export class ClienteProveedorHistorialService {
  constructor(
    private historialRepository: ClienteProveedorHistorialRepository
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
   * Detecta cambios entre dos objetos de cliente/proveedor
   */
  private detectChanges(
    oldData: ClienteProveedorData,
    newData: ClienteProveedorData
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

    const fields: (keyof ClienteProveedorData)[] = [
      "nombre",
      "rfc",
      "tipo",
      "direccion",
      "telefono",
      "email",
      "contacto",
      "numeroCuenta",
      "clabe",
      "banco",
      "activo",
      "fechaRegistro",
      "notas",
      "socioId",
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
   * Crea registros de historial para un cliente/proveedor recién creado
   */
  async createHistorialForNewClienteProveedor(
    clienteProveedor: ClienteProveedorEntity,
    usuarioId?: string | null
  ): Promise<Result<void, Error>> {
    try {
      const clienteProveedorData: ClienteProveedorData = {
        nombre: clienteProveedor.nombre,
        rfc: clienteProveedor.rfc,
        tipo: clienteProveedor.tipo,
        direccion: clienteProveedor.direccion,
        telefono: clienteProveedor.telefono,
        email: clienteProveedor.email,
        contacto: clienteProveedor.contacto,
        numeroCuenta: clienteProveedor.numeroCuenta,
        clabe: clienteProveedor.clabe,
        banco: clienteProveedor.banco,
        activo: clienteProveedor.activo,
        fechaRegistro: clienteProveedor.fechaRegistro,
        notas: clienteProveedor.notas,
        socioId: clienteProveedor.socioId,
      };

      // Crear registros de historial para todos los campos iniciales
      const historialRecords = Object.keys(clienteProveedorData).map((field) => ({
        clienteProveedorId: clienteProveedor.id,
        campo: field,
        valorAnterior: null,
        valorNuevo: this.formatValue(
          clienteProveedorData[field as keyof ClienteProveedorData]
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
          : new Error("Error al crear historial para nuevo cliente/proveedor")
      );
    }
  }

  /**
   * Crea registros de historial para los cambios detectados en una actualización
   */
  async createHistorialForUpdate(
    oldClienteProveedor: ClienteProveedorEntity,
    newClienteProveedor: ClienteProveedorEntity,
    usuarioId?: string | null
  ): Promise<Result<void, Error>> {
    try {
      const oldData: ClienteProveedorData = {
        nombre: oldClienteProveedor.nombre,
        rfc: oldClienteProveedor.rfc,
        tipo: oldClienteProveedor.tipo,
        direccion: oldClienteProveedor.direccion,
        telefono: oldClienteProveedor.telefono,
        email: oldClienteProveedor.email,
        contacto: oldClienteProveedor.contacto,
        numeroCuenta: oldClienteProveedor.numeroCuenta,
        clabe: oldClienteProveedor.clabe,
        banco: oldClienteProveedor.banco,
        activo: oldClienteProveedor.activo,
        fechaRegistro: oldClienteProveedor.fechaRegistro,
        notas: oldClienteProveedor.notas,
        socioId: oldClienteProveedor.socioId,
      };

      const newData: ClienteProveedorData = {
        nombre: newClienteProveedor.nombre,
        rfc: newClienteProveedor.rfc,
        tipo: newClienteProveedor.tipo,
        direccion: newClienteProveedor.direccion,
        telefono: newClienteProveedor.telefono,
        email: newClienteProveedor.email,
        contacto: newClienteProveedor.contacto,
        numeroCuenta: newClienteProveedor.numeroCuenta,
        clabe: newClienteProveedor.clabe,
        banco: newClienteProveedor.banco,
        activo: newClienteProveedor.activo,
        fechaRegistro: newClienteProveedor.fechaRegistro,
        notas: newClienteProveedor.notas,
        socioId: newClienteProveedor.socioId,
      };

      const changes = this.detectChanges(oldData, newData);

      if (changes.length === 0) {
        // No hay cambios, no crear registros de historial
        return Ok(undefined);
      }

      // Crear registros de historial solo para campos que cambiaron
      const historialRecords = changes.map((change) => ({
        clienteProveedorId: newClienteProveedor.id,
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
   * Obtiene el historial de cambios de un cliente/proveedor
   */
  async getHistorialByClienteProveedorId(
    clienteProveedorId: string
  ): Promise<Result<ClienteProveedorHistorial[], Error>> {
    try {
      const historial = await this.historialRepository.findByClienteProveedorId({
        clienteProveedorId,
      });

      return Ok(historial);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener historial del cliente/proveedor")
      );
    }
  }
}

