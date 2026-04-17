import {
  getISOWeek,
  getISOWeekYear,
  endOfISOWeek,
  startOfISOWeek,
  getISOWeeksInYear,
} from "date-fns";
import { TZDate } from "@date-fns/tz";

const CDMX_TZ = "America/Mexico_City";

/**
 * Retorna la fecha actual en timezone CDMX
 */
export function getCurrentCDMXDate(): TZDate {
  return new TZDate(new Date(), CDMX_TZ);
}

/**
 * Retorna el año y semana ISO actuales en CDMX
 */
export function getCurrentWeekInfo(): { ano: number; semana: number } {
  const now = getCurrentCDMXDate();
  return { ano: getISOWeekYear(now), semana: getISOWeek(now) };
}

/**
 * Retorna la fecha límite (domingo 23:59:59.999 CDMX) de la semana ISO indicada
 */
export function getWeekDeadline(ano: number, semana: number): Date {
  // Jan 4 siempre cae en la semana 1 del año ISO
  const refDate = new TZDate(new Date(ano, 0, 4), CDMX_TZ);
  const weekStart = startOfISOWeek(refDate);
  // Offset al inicio de la semana objetivo
  const targetStart = new Date(
    weekStart.getTime() + (semana - 1) * 7 * 24 * 60 * 60 * 1000,
  );
  const targetEnd = endOfISOWeek(new TZDate(targetStart, CDMX_TZ));
  targetEnd.setHours(23, 59, 59, 999);
  return targetEnd;
}

/**
 * Retorna true si la fecha actual está dentro del plazo de edición de la semana indicada
 */
export function isWithinDeadline(ano: number, semana: number): boolean {
  const now = getCurrentCDMXDate();
  const deadline = getWeekDeadline(ano, semana);
  return now.getTime() <= deadline.getTime();
}

/**
 * Retorna true si la semana ISO es válida para el año dado
 */
export function isValidISOWeek(ano: number, semana: number): boolean {
  const maxWeeks = getISOWeeksInYear(new Date(ano, 0, 1));
  return semana >= 1 && semana <= maxWeeks;
}
