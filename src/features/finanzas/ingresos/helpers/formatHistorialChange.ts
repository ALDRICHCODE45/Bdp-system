import { formatFieldValue } from "./formatHistorialField";

/**
 * Genera una descripción legible de un cambio en el historial
 */
export function formatChangeDescription(
  campo: string,
  valorAnterior: string | null,
  valorNuevo: string
): string {
  const valorAnteriorFormateado = formatFieldValue(campo, valorAnterior);
  const valorNuevoFormateado = formatFieldValue(campo, valorNuevo);

  // Si no hay valor anterior, es una creación inicial
  if (valorAnterior === null || valorAnterior === "") {
    return `Se estableció como ${valorNuevoFormateado}`;
  }

  // Si los valores son iguales (después de formatear), no hay cambio real
  if (valorAnteriorFormateado === valorNuevoFormateado) {
    return `Sin cambios (${valorNuevoFormateado})`;
  }

  // Cambio normal
  return `Cambió de "${valorAnteriorFormateado}" a "${valorNuevoFormateado}"`;
}

