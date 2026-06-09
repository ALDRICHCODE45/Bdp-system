import * as XLSX from "xlsx";

/**
 * Spanish month abbreviations and full names mapped to 0-based month index.
 *
 * Covers all standard abbreviations used in Mexican/Spanish Excel files.
 * "sept" is accepted as an alternate abbreviation for September alongside "sep".
 */
const SPANISH_MONTHS: Record<string, number> = {
  // Abbreviations
  en: 0,
  ene: 0,
  feb: 1,
  mar: 2,
  abr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  ago: 7,
  sep: 8,
  sept: 8,
  oct: 9,
  nov: 10,
  dic: 11,
  // Full names
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

/**
 * Regex that matches the Spanish date format: D-MMM-YY or DD-MMM-YY
 *
 * Captures:
 *  [1] day (1 or 2 digits)
 *  [2] month abbreviation or full name (Spanish)
 *  [3] year (2 digits)
 *
 * Separator can be hyphen or slash.
 */
const SPANISH_DATE_REGEX = /^(\d{1,2})[/-]([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)[/-](\d{2})$/;

const MIN_EXCEL_DATE_SERIAL = 1;
const MAX_EXCEL_DATE_SERIAL = 2958465;

function createUtcDate(year: number, monthIndex: number, day: number): Date | null {
  const date = new Date(Date.UTC(year, monthIndex, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== monthIndex ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

function parseExcelSerialDate(value: unknown): Date | null {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value.trim())
        : Number.NaN;

  if (
    !Number.isFinite(numericValue) ||
    !Number.isInteger(numericValue) ||
    numericValue < MIN_EXCEL_DATE_SERIAL ||
    numericValue > MAX_EXCEL_DATE_SERIAL
  ) {
    return null;
  }

  const parsed = XLSX.SSF.parse_date_code(numericValue);
  if (!parsed) return null;

  return createUtcDate(parsed.y, parsed.m - 1, parsed.d);
}

/**
 * Parses either a Spanish short date string (D-MMM-YY or DD-MMM-YY)
 * or an Excel numeric date serial.
 *
 * Strict parser — only accepts the supported Spanish date format
 * or a valid Excel serial date.
 * Does NOT fall back to `new Date()` for unrecognized formats.
 *
 * **2-digit year resolution**:
 * Years 0–49 map to 2000–2049; years 50–99 map to 1950–1999.
 * This is consistent with the Excel DATEVALUE convention and covers
 * the practical range for financial records (historical data back to ~1950,
 * future data up to ~2049).
 *
 * @example
 * parseSpanishDate("5-ene-26")    // → Date(2026, 0, 5)  — January 5, 2026
 * parseSpanishDate("5-en-26")     // → Date(2026, 0, 5)  — January 5, 2026
 * parseSpanishDate("31-dic-99")   // → Date(1999, 11, 31) — December 31, 1999
 * parseSpanishDate("15-ago-21")   // → Date(2021, 7, 15)  — August 15, 2021
 * parseSpanishDate("1-septiembre-23") // → Date(2023, 8, 1) — September 1, 2023
 * parseSpanishDate(46053)          // → Date(2026, 0, 31) — Excel serial date
 * parseSpanishDate("2026-01-05")  // → null (ISO format not accepted)
 * parseSpanishDate("5-jan-26")    // → null (English abbreviation not accepted)
 * parseSpanishDate("")            // → null
 * parseSpanishDate(null)          // → null
 *
 * @param value - The raw cell value (string, number, or other)
 * @returns A Date object if valid, or null if the value cannot be parsed
 */
export function parseSpanishDate(value: unknown): Date | null {
  if (value === null || value === undefined) return null;

  const excelSerialDate = parseExcelSerialDate(value);
  if (excelSerialDate) return excelSerialDate;

  const str = String(value).trim();
  if (str === "") return null;

  const match = str.match(SPANISH_DATE_REGEX);
  if (!match) return null;

  const [, dayStr, monthStr, yearStr] = match;

  // Look up month (case-insensitive)
  const monthIndex = SPANISH_MONTHS[monthStr.toLowerCase()];
  if (monthIndex === undefined) return null;

  const day = parseInt(dayStr, 10);
  const yearShort = parseInt(yearStr, 10);

  // 2-digit year resolution: 0-49 → 2000s, 50-99 → 1900s
  const year = yearShort <= 49 ? 2000 + yearShort : 1900 + yearShort;

  return createUtcDate(year, monthIndex, day);
}
