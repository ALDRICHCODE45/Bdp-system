import { createHash } from "crypto";

/**
 * Computes a deterministic SHA-256 deduplication hash for a Movimiento.
 *
 * The hash is based on the five core identifying fields from the bank statement:
 * titular, estadoCuenta, fechaOperacion, monto, and descripcionLiteral.
 *
 * Same input always produces the same hash. Used to prevent duplicate imports
 * from bank-statement Excel files.
 *
 * @param input - The core fields to hash
 * @returns Hex-encoded SHA-256 hash string
 *
 * @example
 * ```ts
 * const hash = computeMovimientoDedupHash({
 *   titular: "BDP ADMINISTRADORES",
 *   estadoCuenta: "123456789",
 *   fechaOperacion: new Date("2026-01-15"),
 *   monto: 15000.50,
 *   descripcionLiteral: "TRANSFERENCIA RECIBIDA",
 * });
 * // => "a1b2c3d4..."
 * ```
 */
export function computeMovimientoDedupHash(input: {
  titular: string;
  estadoCuenta: string;
  fechaOperacion: Date | string;
  monto: number | string;
  descripcionLiteral: string;
}): string {
  const fechaISO =
    input.fechaOperacion instanceof Date
      ? input.fechaOperacion.toISOString()
      : new Date(input.fechaOperacion).toISOString();

  const montoStr =
    typeof input.monto === "number"
      ? input.monto.toFixed(2)
      : parseFloat(input.monto).toFixed(2);

  const normalized = [
    input.titular.trim().toLowerCase(),
    input.estadoCuenta.trim().toLowerCase(),
    fechaISO,
    montoStr,
    input.descripcionLiteral.trim().toLowerCase(),
  ].join("|");

  return createHash("sha256").update(normalized).digest("hex");
}
