/**
 * Determines whether an Excel row is completely empty.
 *
 * A row is considered empty if every cell is null, undefined, or an empty string.
 * Empty rows are typically skipped during import without reporting an error.
 *
 * @param row - Array of cell values from a single Excel row
 * @returns true if all cells are empty
 */
export function isEmptyRow(row: unknown[]): boolean {
  return row.every(
    (cell) => cell === null || cell === undefined || cell === ""
  );
}
