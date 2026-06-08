/**
 * Normalizes a column header string for fuzzy matching.
 *
 * Transforms the header to a canonical form by:
 * 1. Converting to lowercase
 * 2. Trimming whitespace
 * 3. Collapsing multiple whitespace into a single space
 * 4. Stripping accents (diacritical marks)
 * 5. Replacing hyphens and underscores with spaces
 *
 * @example
 * normalizeColumnHeader("RFC Emisor")        // → "rfc emisor"
 * normalizeColumnHeader("Método Pago")       // → "metodo pago"
 * normalizeColumnHeader("  Edo.  Cta  ")     // → "edo. cta"
 * normalizeColumnHeader("FECHA_CORTE")       // → "fecha corte"
 * normalizeColumnHeader("Descripción-Lit")   // → "descripcion lit"
 *
 * @param header - The raw header text from the Excel cell
 * @returns The normalized header string
 */
export function normalizeColumnHeader(header: string): string {
  return String(header)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_\-]/g, " ");
}
