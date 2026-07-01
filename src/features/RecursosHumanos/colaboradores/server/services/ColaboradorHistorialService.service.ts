import { ColaboradorHistorialRepository } from "../repositories/ColaboradorHistorialRepository.repository";
import { ColaboradorWithSocio } from "../repositories/ColaboradorRepository.repository";
import { Result, Err, Ok } from "@/core/shared/result/result";
import { Prisma, ColaboradorHistorial, ModalidadTrabajo, TipoContrato } from "@prisma/client";

/**
 * Typed shape of the fields we track in `ColaboradorHistorial`.
 *
 * Layout notes:
 * - Includes the original legacy fields (name, correo, puesto, …) so existing
 *   history rows continue to compare without drift.
 * - Adds the personal fields from cap4 (fechaNacimiento, genero, estadoCivil,
 *   nacionalidad, documentoIdentidad, tipoSangre, rfc, curp,
 *   nombrePreferido, emailPersonal, direccion, telefono) and the profile-
 *   shaped fields from cap5 (modalidad, tipoContrato, lugarTrabajo, horario,
 *   fechaSalida, bio).
 * - Deliberately EXCLUDES `departamento` and `nivel`: those go through
 *   `ColaboradorPositionHistory` (P3 task 4.11 / P4 task 5.x — CC5 / cap5
 *   req6 / cap6 req5). Tracking them in BOTH places would be a duplicate.
 * - `sueldo` is intentionally retained here even though ADR-1 says
 *   SalaryHistory is the canonical home for salary audits: the current
 *   behaviour already tracks it, and removing it now would orphan legacy
 *   history. P4 will own the SalaryHistory UI; the canonical audit row is
 *   SalaryHistory for new writes.
 */
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
  // Datos personales (P3 task 4.13)
  fechaIngreso: Date;
  fechaNacimiento: Date | null;
  genero: string | null;
  nacionalidad: string | null;
  estadoCivil: string | null;
  tipoSangre: string | null;
  // Datos fiscales
  rfc: string | null;
  curp: string | null;
  // Contacto y dirección
  direccion: string | null;
  telefono: string | null;
  // Académicos y laborales previos
  ultimoGradoEstudios: string | null;
  escuela: string | null;
  ultimoTrabajo: string | null;
  // Referencias personales
  nombreReferenciaPersonal: string | null;
  telefonoReferenciaPersonal: string | null;
  parentescoReferenciaPersonal: string | null;
  // Referencias laborales
  nombreReferenciaLaboral: string | null;
  telefonoReferenciaLaboral: string | null;
  // Perfil extendido (P0 — P3 task 4.13)
  nombrePreferido: string | null;
  documentoIdentidad: string | null;
  emailPersonal: string | null;
  // Perfil laboral (P3 task 4.13 — excludes departamento/nivel, see comment above)
  modalidad: ModalidadTrabajo | null;
  tipoContrato: TipoContrato | null;
  lugarTrabajo: string | null;
  horario: string | null;
  fechaSalida: Date | null;
  bio: string | null;
};

export class ColaboradorHistorialService {
  constructor(
    private historialRepository: ColaboradorHistorialRepository
  ) {}

  /**
   * Formatea un valor a string para almacenamiento en el historial.
   *
   * P3 task 4.13: extended to handle `Date` instances (was relying on
   * `String(date)` which yields a verbose, locale-dependent representation).
   * We always serialize Dates with `.toISOString()` so equality comparisons
   * are deterministic across renders.
   */
  private formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return "";
    }

    // Decimal de Prisma
    if (value instanceof Prisma.Decimal) {
      return value.toString();
    }

    // Date → ISO string for stable comparison
    if (value instanceof Date) {
      try {
        return value.toISOString();
      } catch {
        return "";
      }
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
   * Detecta cambios entre dos objetos de colaborador.
   *
   * P3 task 4.13: extended to include the personal and profile fields added
   * in P0 + cap4. `departamento` and `nivel` are intentionally NOT tracked
   * here — those go through ColaboradorPositionHistory (P3 4.11).
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
      // Legacy fields kept so existing history rows keep comparing cleanly.
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
      // Datos personales (cap4 / P3 4.13)
      "fechaIngreso",
      "fechaNacimiento",
      "genero",
      "nacionalidad",
      "estadoCivil",
      "tipoSangre",
      // Datos fiscales (cap4 / P3 4.13)
      "rfc",
      "curp",
      // Contacto y dirección (cap4 / P3 4.13)
      "direccion",
      "telefono",
      // Académicos y laborales previos (already in entity, now also tracked)
      "ultimoGradoEstudios",
      "escuela",
      "ultimoTrabajo",
      // Referencias personales
      "nombreReferenciaPersonal",
      "telefonoReferenciaPersonal",
      "parentescoReferenciaPersonal",
      // Referencias laborales
      "nombreReferenciaLaboral",
      "telefonoReferenciaLaboral",
      // Perfil extendido (P0 — P3 4.13)
      "nombrePreferido",
      "documentoIdentidad",
      "emailPersonal",
      // Perfil laboral shape (P0 — P3 4.13, sin departamento/nivel)
      "modalidad",
      "tipoContrato",
      "lugarTrabajo",
      "horario",
      "fechaSalida",
      "bio",
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
   * Extracts a `ColaboradorData` snapshot from a Prisma `Colaborador`
   * row (which always carries a `socioId`/`socio` relation but never has the
   * P0/lifecycle fields optional-shaped).
   */
  private toColaboradorData(
    colaborador: ColaboradorWithSocio
  ): ColaboradorData {
    return {
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
      // Datos personales
      fechaIngreso: colaborador.fechaIngreso,
      fechaNacimiento: colaborador.fechaNacimiento,
      genero: colaborador.genero,
      nacionalidad: colaborador.nacionalidad,
      estadoCivil: colaborador.estadoCivil,
      tipoSangre: colaborador.tipoSangre,
      // Datos fiscales
      rfc: colaborador.rfc,
      curp: colaborador.curp,
      // Contacto y dirección
      direccion: colaborador.direccion,
      telefono: colaborador.telefono,
      // Académicos y laborales previos
      ultimoGradoEstudios: colaborador.ultimoGradoEstudios,
      escuela: colaborador.escuela,
      ultimoTrabajo: colaborador.ultimoTrabajo,
      // Referencias personales
      nombreReferenciaPersonal: colaborador.nombreReferenciaPersonal,
      telefonoReferenciaPersonal: colaborador.telefonoReferenciaPersonal,
      parentescoReferenciaPersonal: colaborador.parentescoReferenciaPersonal,
      // Referencias laborales
      nombreReferenciaLaboral: colaborador.nombreReferenciaLaboral,
      telefonoReferenciaLaboral: colaborador.telefonoReferenciaLaboral,
      // Perfil extendido (P0)
      nombrePreferido: colaborador.nombrePreferido,
      documentoIdentidad: colaborador.documentoIdentidad,
      emailPersonal: colaborador.emailPersonal,
      // Perfil laboral (P0)
      modalidad: colaborador.modalidad,
      tipoContrato: colaborador.tipoContrato,
      lugarTrabajo: colaborador.lugarTrabajo,
      horario: colaborador.horario,
      fechaSalida: colaborador.fechaSalida,
      bio: colaborador.bio,
    };
  }

  /**
   * Crea registros de historial para un colaborador recién creado
   */
  async createHistorialForNewColaborador(
    colaborador: ColaboradorWithSocio,
    usuarioId?: string | null
  ): Promise<Result<void, Error>> {
    try {
      const colaboradorData = this.toColaboradorData(colaborador);

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
      const oldData = this.toColaboradorData(oldColaborador);
      const newData = this.toColaboradorData(newColaborador);

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

