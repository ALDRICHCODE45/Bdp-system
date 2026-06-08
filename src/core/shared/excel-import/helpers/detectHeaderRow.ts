import { normalizeColumnHeader } from "./normalizeColumnHeader";

/**
 * Result of a successful header row detection.
 */
export interface HeaderDetectionResult {
  /** 0-based array index of the header row */
  headerRow: number;
  /**
   * Map from canonical field name to 0-based column index.
   * Example: { "estadoCuenta": 2, "fechaCorte": 3 }
   */
  columnMap: Record<string, number>;
}

/**
 * Result of a failed header row detection.
 */
export interface HeaderDetectionError {
  error: string;
}

/**
 * Scans the first N rows of an Excel sheet to find the header row.
 *
 * A row is considered a header if it contains at least `minMatches` cells
 * that match known column aliases. The aliases map is provided by the consumer
 * so this function stays feature-agnostic.
 *
 * @param rows - Array of rows, where each row is an array of cell values
 * @param aliases - Map of canonical field name to accepted header aliases.
 *   Example: { "estadoCuenta": ["edo cta", "estado de cuenta"] }
 *   Alias values should be pre-normalized (lowercase, no accents) for performance,
 *   but this function normalizes them anyway for safety.
 * @param minMatches - Minimum number of recognized columns to consider a row as header (default: 3)
 * @param scanRows - Maximum number of rows to scan from the top (default: 30)
 * @returns Either a HeaderDetectionResult with the header row and column map,
 *   or a HeaderDetectionError if no header row was found
 */
export function detectHeaderRow(
  rows: unknown[][],
  aliases: Record<string, string[]>,
  minMatches: number = 3,
  scanRows: number = 30
): HeaderDetectionResult | HeaderDetectionError {
  // Build a reverse lookup: normalized alias → canonical field name
  const aliasToField = new Map<string, string>();
  for (const [fieldName, aliasList] of Object.entries(aliases)) {
    for (const alias of aliasList) {
      aliasToField.set(normalizeColumnHeader(alias), fieldName);
    }
  }

  for (let i = 0; i < Math.min(rows.length, scanRows); i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const columnMap: Record<string, number> = {};
    let matchCount = 0;

    for (let j = 0; j < row.length; j++) {
      const cell = row[j];
      if (cell === null || cell === undefined || cell === "") continue;

      const normalized = normalizeColumnHeader(String(cell));
      const fieldName = aliasToField.get(normalized);

      if (fieldName) {
        // If this field is already mapped (duplicate column), skip the second one
        if (!(fieldName in columnMap)) {
          columnMap[fieldName] = j;
          matchCount++;
        }
      }
    }

    if (matchCount >= minMatches) {
      return { headerRow: i, columnMap };
    }
  }

  return {
    error:
      `No recognizable header row found in the first ${scanRows} rows. ` +
      `Expected at least ${minMatches} matching column headers.`,
  };
}
