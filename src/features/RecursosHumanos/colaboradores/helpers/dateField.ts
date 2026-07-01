import { format, parse } from "date-fns";

/**
 * Round-trip helpers for the colaborador date fields that are stored in the
 * form / useState as "YYYY-MM-DD" strings but need to be wired through the
 * custom `<DatePicker>` (which works with `Date` objects).
 *
 * The timezone footgun we're avoiding:
 * - `new Date("2026-01-07")` parses as UTC midnight. In negative-offset
 *   timezones (America/Mexico_City is UTC-6) that instant is
 *   `2026-01-06 18:00 local`, so the DatePicker would render the previous
 *   day.
 * - `date.toISOString().slice(0, 10)` returns the UTC date and has the same
 *   shift on the way back.
 *
 * The fix is to only ever go through LOCAL parts:
 *   "2026-01-07" ─▶ parse(yyyy-MM-dd) ─▶ Date(2026, 0, 7, 0, 0, 0 local)
 *                              ─▶ format(yyyy-MM-dd) ─▶ "2026-01-07"
 *
 * Net effect: the value stored in form state / useState is byte-identical
 * to what the native `<Input type="date">` produced today, so FormData,
 * server actions, and the inclusive-days math in AusenciasTab keep their
 * existing semantics.
 */

/**
 * Parse a "YYYY-MM-DD" string into a local Date. Returns `undefined` for
 * empty or malformed input so the DatePicker falls back to its placeholder.
 */
export function parseYmdToDate(
  value: string | null | undefined
): Date | undefined {
  if (!value) return undefined;
  // Strict shape check: the form state must be exactly "YYYY-MM-DD".
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const date = parse(`${match[1]}-${match[2]}-${match[3]}`, "yyyy-MM-dd", new Date());
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

/**
 * Format a Date into "YYYY-MM-DD" using LOCAL parts. Returns "" when the
 * Date is undefined / invalid (e.g. the user cleared the picker) so the
 * form state stays consistent with the previous empty-string behavior.
 */
export function formatDateToYmd(date: Date | undefined): string {
  if (!date || Number.isNaN(date.getTime())) return "";
  return format(date, "yyyy-MM-dd");
}