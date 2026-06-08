/**
 * Converts any Excel cell value to a trimmed string, or null if empty.
 *
 * @param value - The raw cell value from xlsx
 * @returns The trimmed string, or null if the value is null, undefined, or empty after trimming
 */
export function parseCellToString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str === "" ? null : str;
}
