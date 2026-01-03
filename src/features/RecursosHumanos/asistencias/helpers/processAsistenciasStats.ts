import { startOfWeek, format, parseISO, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { AsistenciaDto } from "../server/Dtos/AsistenciaDto.dto";

export type WeekStats = {
  weekStart: Date;
  weekStartISO: string;
  weekLabel: string;
  weekRange: string;
  tardanzas: number;
  color: "green" | "yellow" | "red";
};

// Reglas de negocio hardcoded
const HORA_LIMITE_ENTRADA = { hour: 8, minute: 15 };

/**
 * Calcula el inicio de la semana (lunes) para una fecha dada
 */
function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // 1 = lunes
}

/**
 * Verifica si una fecha es un día laboral (lunes a viernes)
 */
function isWorkDay(date: Date): boolean {
  const dayOfWeek = getDay(date); // 0 = domingo, 1 = lunes, ..., 6 = sábado
  return dayOfWeek >= 1 && dayOfWeek <= 5; // lunes (1) a viernes (5)
}

/**
 * Verifica si una hora de entrada es tardanza
 */
function isLateEntry(fechaHora: Date): boolean {
  const horaEntrada = fechaHora.getHours();
  const minutoEntrada = fechaHora.getMinutes();

  // Comparar con 08:15 (tolerancia)
  if (horaEntrada > HORA_LIMITE_ENTRADA.hour) {
    return true;
  }
  if (
    horaEntrada === HORA_LIMITE_ENTRADA.hour &&
    minutoEntrada > HORA_LIMITE_ENTRADA.minute
  ) {
    return true;
  }

  return false;
}

/**
 * Formatea el rango de fechas de una semana (lunes a viernes)
 */
function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 4); // viernes

  const startFormatted = format(weekStart, "d MMM", { locale: es });
  const endFormatted = format(weekEnd, "d MMM yyyy", { locale: es });

  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Asigna color según cantidad de tardanzas
 */
function assignColor(tardanzas: number): "green" | "yellow" | "red" {
  if (tardanzas <= 1) {
    return "green";
  }
  if (tardanzas <= 3) {
    return "yellow";
  }
  return "red";
}

/**
 * Procesa asistencias y las agrupa por semana con estadísticas
 */
export function processAsistenciasStats(
  asistencias: AsistenciaDto[],
): WeekStats[] {
  // Convertir fechas string a Date si es necesario
  const asistenciasWithDates = asistencias.map((asistencia) => ({
    ...asistencia,
    fecha:
      typeof asistencia.fecha === "string"
        ? parseISO(asistencia.fecha)
        : asistencia.fecha,
  }));

  // Agrupar por semana (inicio de semana = lunes)
  const semanasMap = new Map<string, Date[]>();

  asistenciasWithDates.forEach((asistencia) => {
    // Solo procesar entradas en días laborales
    if (asistencia.tipo === "Entrada" && isWorkDay(asistencia.fecha)) {
      const weekStart = getWeekStart(asistencia.fecha);
      const weekKey = weekStart.toISOString();

      if (!semanasMap.has(weekKey)) {
        semanasMap.set(weekKey, []);
      }

      semanasMap.get(weekKey)?.push(asistencia.fecha);
    }
  });

  // Calcular estadísticas por semana
  const semanasStats: WeekStats[] = [];

  semanasMap.forEach((entradas, weekKey) => {
    const weekStart = parseISO(weekKey);
    const tardanzas = entradas.filter((fecha) => isLateEntry(fecha)).length;

    semanasStats.push({
      weekStart,
      weekStartISO: weekKey,
      weekLabel: format(weekStart, "dd/MM/yyyy", { locale: es }),
      weekRange: formatWeekRange(weekStart),
      tardanzas,
      color: assignColor(tardanzas),
    });
  });

  // Ordenar por fecha (más recientes primero)
  return semanasStats.sort(
    (a, b) => b.weekStart.getTime() - a.weekStart.getTime(),
  );
}

/**
 * Filtra semanas procesadas según las semanas seleccionadas
 */
export function filterWeeksBySelection(
  allWeeks: WeekStats[],
  selectedWeekStarts: string[],
): WeekStats[] {
  return allWeeks.filter((week) =>
    selectedWeekStarts.includes(week.weekStartISO),
  );
}

