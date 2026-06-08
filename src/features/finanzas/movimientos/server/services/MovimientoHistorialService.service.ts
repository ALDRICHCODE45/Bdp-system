import type { Movimiento } from "@prisma/client";
import { Result, Ok, Err } from "@/core/shared/result/result";
import type { MovimientoHistorialRepository } from "../repositories/MovimientoHistorialRepository.repository";
import type { MovimientoHistorialDto } from "../dtos/MovimientoHistorialDto.dto";
import { toMovimientoHistorialDtoArray } from "../mappers/movimientoHistorialMapper";

// ---------------------------------------------------------------------------
// Fields tracked for historial diffing
// ---------------------------------------------------------------------------

/**
 * Fields to track for change history.
 * Map of field name → human-readable label.
 */
const TRACKED_FIELDS: Record<string, string> = {
  tipo: "Tipo",
  titular: "Titular",
  estadoCuenta: "Estado de Cuenta",
  fechaCorte: "Fecha de Corte",
  fechaOperacion: "Fecha de Operacion",
  descripcionLiteral: "Descripcion Literal",
  monto: "Monto",
  estado: "Estado",
  concepto: "Concepto",
  descripcionAdministracion: "Descripcion de Administracion",
  categoria: "Categoria",
  formaPago: "Forma de Pago",
  cargoAbono: "Cargo/Abono",
  facturadoPor: "Facturado Por",
  periodo: "Periodo",
  numeroFactura: "Numero de Factura",
  folioFiscal: "Folio Fiscal",
  proveedor: "Proveedor",
  proveedorId: "Proveedor (ID)",
  cliente: "Cliente",
  clienteId: "Cliente (ID)",
  solicitanteId: "Solicitante",
  autorizadorId: "Autorizador",
  notas: "Notas",
  facturaId: "Factura (ID)",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stringify(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && "toString" in value) return value.toString();
  return String(value);
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class MovimientoHistorialService {
  constructor(
    private readonly historialRepo: MovimientoHistorialRepository
  ) {}

  /**
   * Get all historial entries for a movimiento, ordered by fechaCambio desc.
   */
  async getByMovimientoId(
    movimientoId: string
  ): Promise<Result<MovimientoHistorialDto[], Error>> {
    try {
      const entries =
        await this.historialRepo.findByMovimientoId(movimientoId);
      return Ok(toMovimientoHistorialDtoArray(entries));
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al obtener historial del movimiento")
      );
    }
  }

  /**
   * Computes the diff between two Movimiento snapshots and creates
   * historial entries for each changed tracked field.
   *
   * @returns The number of historial entries created.
   */
  async recordChanges(args: {
    movimientoId: string;
    usuarioId: string | null;
    before: Movimiento;
    after: Movimiento;
  }): Promise<Result<number, Error>> {
    try {
      const entries: {
        movimientoId: string;
        campo: string;
        valorAnterior: string | null;
        valorNuevo: string;
        usuarioId: string | null;
        motivo: string | null;
      }[] = [];

      for (const [field, label] of Object.entries(TRACKED_FIELDS)) {
        const oldVal = stringify(
          (args.before as Record<string, unknown>)[field]
        );
        const newVal = stringify(
          (args.after as Record<string, unknown>)[field]
        );

        if (oldVal !== newVal) {
          entries.push({
            movimientoId: args.movimientoId,
            campo: label,
            valorAnterior: oldVal || null,
            valorNuevo: newVal,
            usuarioId: args.usuarioId,
            motivo: null,
          });
        }
      }

      if (entries.length === 0) return Ok(0);

      const count = await this.historialRepo.createMany(entries);
      return Ok(count);
    } catch (error) {
      return Err(
        error instanceof Error
          ? error
          : new Error("Error al registrar cambios en historial")
      );
    }
  }
}
