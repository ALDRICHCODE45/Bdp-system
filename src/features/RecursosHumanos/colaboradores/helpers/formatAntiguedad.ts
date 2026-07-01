import { differenceInYears, differenceInMonths } from "date-fns";

/**
 * Computes tenure ("antigüedad") from a `fechaIngreso` ISO string down to the
 * current day. Returns "Sin fecha de ingreso" when the input is null (spec
 * cap3 req2) — never a fabricated zero or negative value.
 *
 * Output forms (Spanish):
 * - "1 año"        — exactly one year, no extra months
 * - "2 años 5 meses" — the spec cap3 scenario (>= 1 year, with months)
 * - "0 años"        — less than a year, 0 whole years (rare in practice but
 *                    possible on the day of ingreso)
 * - "11 meses"      — under a year; months >= 1
 * - "0 meses"       — string of months = 0 (a same-day render — degenerate
 *                    but a real possible state). We collapse to "Sin fecha
 *                    de ingreso" only when the input itself is null/empty.
 *
 * NOTE: rounding is "floor" (differenceInMonths / differenceInYears) — we
 * do not round to the nearest, so an incomplete month never advances the
 * counter. This matches what the spec expects from "years + months".
 */
export function formatAntiguedad(fechaIngreso: string | null): string {
  if (!fechaIngreso) {
    return "Sin fecha de ingreso";
  }

  const ingreso = new Date(fechaIngreso);
  if (Number.isNaN(ingreso.getTime())) {
    return "Sin fecha de ingreso";
  }

  const today = new Date();

  // Total completed months is the most robust figure to split into years/months,
  // because differenceInYears alone loses the leftover months and
  // differenceInMonths alone loses the year count.
  const totalMonths = differenceInMonths(today, ingreso);
  if (totalMonths < 0) {
    // future fechaIngreso — never expected, render defensively rather than
    // emit a negative tenure.
    return "Sin fecha de ingreso";
  }

  const years = differenceInYears(today, ingreso);
  const months = totalMonths - years * 12;

  const yearLabel = years === 1 ? "1 año" : `${years} años`;
  const monthLabel =
    months === 1 ? "1 mes" : `${months} meses`;

  if (years === 0 && months === 0) {
    // Same-day render: collapse to a non-fabricated, non-zero phrase.
    return "Menos de un mes";
  }
  if (years === 0) {
    return monthLabel;
  }
  if (months === 0) {
    return yearLabel;
  }
  return `${yearLabel} ${monthLabel}`;
}
