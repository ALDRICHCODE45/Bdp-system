import { ColaboradorHistorialRepository } from "../repositories/ColaboradorHistorialRepository.repository";
import { ColaboradorWithSocio } from "../repositories/ColaboradorRepository.repository";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { Prisma, ColaboradorHistorial } from "@prisma/client";

type ColaboradorData = {
  name: string;
  correo: string;
  puesto: string;
  status: string;
  imss: boolean;
  socioId: string | null;
  banco: string;
  clabe: string;
  sueldo: Prisma.Decimal | number;
  activos: string[];
};

export class ColaboradorHistorialService {
  constructor(
    private historialRepository: ColaboradorHistorialRepository
  ) {}

  /**
   * Formatea un valor a string para almacenamiento en el historial
   */
  private formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return "";
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
   * Detecta cambios entre dos objetos de colaborador
   */
  private detectChanges(
    oldData: ColaboradorData,
    newData: ColaboradorData
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

    const fields: (keyof ColaboradorData)[] = [
      "name",
      "correo",
      "puesto",
      "status",
      "imss",
      "socioId",
      "banco",
      "clabe",
      "sueldo",
      "activos",
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
   * Crea registros de historial para un colaborador recién creado
   */
  async createHistorialForNewColaborador(
    colaborador: ColaboradorWithSocio,
    usuarioId?: string | null
  ): Promise<Result<void, Error>> {
    try {
      const colaboradorData: ColaboradorData = {
        name: colaborador.name,
        correo: colaborador.correo,
        puesto: colaborador.puesto,
        status: colaborador.status,
        imss: colaborador.imss,
        socioId: colaborador.socioId,
        banco: colaborador.banco,
        clabe: colaborador.clabe,
        sueldo: colaborador.sueldo,
        activos: colaborador.activos,
      };

      // Crear registros de historial para todos los campos iniciales
      const historialRecords = Object.keys(colaboradorData).map((field) => ({
        colaboradorId: colaborador.id,
        campo: field,
        valorAnterior: null,
        valorNuevo: this.formatValue(
          colaboradorData[field as keyof ColaboradorData]
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
          : new Error("Error al crear historial para nuevo colaborador")
      );
    }
  }

  /**
   * Crea registros de historial para los cambios detectados en una actualización
   */
  async createHistorialForUpdate(
    oldColaborador: ColaboradorWithSocio,
    newColaborador: ColaboradorWithSocio,
    usuarioId?: string | null
  ): Promise<Result<void, Error>> {
    try {
      const oldData: ColaboradorData = {
        name: oldColaborador.name,
        correo: oldColaborador.correo,
        puesto: oldColaborador.puesto,
        status: oldColaborador.status,
        imss: oldColaborador.imss,
        socioId: oldColaborador.socioId,
        banco: oldColaborador.banco,
        clabe: oldColaborador.clabe,
        sueldo: oldColaborador.sueldo,
        activos: oldColaborador.activos,
      };

      const newData: ColaboradorData = {
        name: newColaborador.name,
        correo: newColaborador.correo,
        puesto: newColaborador.puesto,
        status: newColaborador.status,
        imss: newColaborador.imss,
        socioId: newColaborador.socioId,
        banco: newColaborador.banco,
        clabe: newColaborador.clabe,
        sueldo: newColaborador.sueldo,
        activos: newColaborador.activos,
      };

      const changes = this.detectChanges(oldData, newData);

      if (changes.length === 0) {
        // No hay cambios, no crear registros de historial
        return Ok(undefined);
      }

      // Crear registros de historial solo para campos que cambiaron
      const historialRecords = changes.map((change) => ({
        colaboradorId: newColaborador.id,
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
   * Obtiene el historial de cambios de un colaborador
   */
  async getHistorialByColaboradorId(
    colaboradorId: string
  ): Promise<Result<ColaboradorHistorial[], Error>> {
    try {
      const historial = await this.historialRepository.findByColaboradorId({
        colaboradorId,
      });

      return Ok(historial);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener historial del colaborador")
      );
    }
  }
}

