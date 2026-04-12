/**
 * Utilidades para el rol Capturador de Facturas
 *
 * El Capturador puede crear y editar únicamente sus propias facturas,
 * con un subconjunto de campos permitidos y una ventana de 24 horas para edición.
 */

/**
 * Campos que el Capturador puede ingresar o editar.
 * Cualquier campo fuera de esta lista debe ser ignorado en el server action.
 */
export const CAPTURADOR_ALLOWED_FIELDS = [
  "rfcEmisor",
  "nombreEmisor",
  "rfcReceptor",
  "nombreReceptor",
  "uuid",
  "concepto",
  "serie",
  "folio",
  "usoCfdi",
  "moneda",
  "subtotal",
  "iva",
  "totalImpuestosTransladados",
  "totalImpuestosRetenidos",
  "total",
] as const;

export type CapturadorAllowedField = (typeof CAPTURADOR_ALLOWED_FIELDS)[number];

/**
 * Verifica si un usuario es SOLO capturador.
 * Retorna true cuando tiene `facturas:capturar` pero NO tiene
 * `facturas:crear`, `facturas:editar`, `facturas:gestionar` ni `admin:all`.
 *
 * @param userPermissions - Array de permisos del usuario
 */
export function isCapturadorOnly(userPermissions: string[]): boolean {
  const hasCapturar = userPermissions.includes("facturas:capturar");
  const hasFullAccess = userPermissions.some((p) =>
    [
      "facturas:crear",
      "facturas:editar",
      "facturas:gestionar",
      "admin:all",
    ].includes(p),
  );
  return hasCapturar && !hasFullAccess;
}

/**
 * Verifica si una factura fue creada hace menos de 24 horas.
 * Usado para la ventana de edición del Capturador.
 *
 * @param createdAt - Fecha de creación de la factura
 */
export function isWithin24Hours(createdAt: Date): boolean {
  return Date.now() - createdAt.getTime() < 86_400_000;
}

/**
 * Filtra un objeto de input para que solo contenga los campos del allowlist.
 * Los campos fuera del allowlist son descartados silenciosamente.
 *
 * @param input - Objeto de entrada (puede contener campos prohibidos)
 * @param allowedKeys - Array readonly de claves permitidas
 */
export function pickAllowedFields<T extends Record<string, unknown>>(
  input: T,
  allowedKeys: readonly string[],
): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const key of allowedKeys) {
    if (key in input) {
      result[key] = input[key];
    }
  }
  return result as Partial<T>;
}
