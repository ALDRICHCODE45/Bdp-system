/**
 * Converts an Excel cell value to a number, or null if not parseable.
 *
 * Handles common formats found in Mexican and European spreadsheets:
 * - MX format: "$1,600.00", "1,600.00", "1600.00"
 * - European format: "$1.600,00", "1.600,00"
 * - Plain strings: "1600", "  1600  "
 * - Currency symbols: "$8.000,00", "€1,200.00"
 * - Already-numeric values: returned as-is
 * - null / undefined / empty string / "-" / "N/A" → null
 *
 * @param value - The raw cell value from xlsx
 * @returns The parsed number, or null if the value cannot be interpreted as a number
 */
export function parseNumericCell(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    return isFinite(value) ? value : null;
  }

  if (typeof value === "boolean") return null;

  const str = String(value).trim();
  if (
    str === "" ||
    str === "-" ||
    str === "N/A" ||
    str.toLowerCase() === "na"
  )
    return null;

  // Strip currency symbols and whitespace
  let cleaned = str.replace(/[$€£¥\s]/g, "");

  // Detect European format: "1.600,00" (dot as thousands, comma as decimal)
  const europeanFormat = /^\d{1,3}(\.\d{3})+(,\d+)?$/.test(cleaned);
  if (europeanFormat) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    // Standard format: strip commas as thousands separator
    cleaned = cleaned.replace(/,/g, "");
  }

  const num = parseFloat(cleaned);
  return isFinite(num) ? num : null;
}
