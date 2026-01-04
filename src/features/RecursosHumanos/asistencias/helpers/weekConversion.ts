import { startOfWeek } from "date-fns";

/**
 * Convierte el inicio de semana de domingo (UI) a lunes (procesamiento de datos)
 * @param weekStartSunday Fecha de inicio de semana que comienza en domingo
 * @returns Fecha de inicio de semana que comienza en lunes
 */
export function getWeekStartMonday(weekStartSunday: Date): Date {
  // Si el domingo es el inicio, el lunes es el día siguiente
  const monday = new Date(weekStartSunday);
  monday.setDate(weekStartSunday.getDate() + 1);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Convierte el inicio de semana de lunes (procesamiento de datos) a domingo (UI)
 * @param weekStartMonday Fecha de inicio de semana que comienza en lunes
 * @returns Fecha de inicio de semana que comienza en domingo
 */
export function getWeekStartSunday(weekStartMonday: Date): Date {
  // Si el lunes es el inicio, el domingo es el día anterior
  const sunday = new Date(weekStartMonday);
  sunday.setDate(weekStartMonday.getDate() - 1);
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

/**
 * Normaliza una fecha al inicio de semana según el día de inicio especificado
 * @param date Fecha a normalizar
 * @param weekStartsOn 0 para domingo, 1 para lunes
 * @returns Fecha ISO string del inicio de semana normalizado
 */
export function normalizeWeekISO(
  date: Date,
  weekStartsOn: 0 | 1
): string {
  const weekStart = startOfWeek(date, { weekStartsOn });
  weekStart.setHours(0, 0, 0, 0);
  return weekStart.toISOString();
}

