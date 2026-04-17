/**
 * Convierte horas decimales a formato "Xh Ym"
 * Ejemplo: 5.4167 → "5h 25m"
 */
export function formatHoras(horasDecimal: number): string {
  const totalMinutes = Math.round(horasDecimal * 60);
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (mins === 0) return `${hrs}h`;
  if (hrs === 0) return `${mins}m`;
  return `${hrs}h ${mins}m`;
}

/**
 * Convierte horas y minutos a decimal
 * Ejemplo: 5h 25m → 5.42
 */
export function horasMinutosToDecimal(horas: number, minutos: number): number {
  return Math.round((horas + minutos / 60) * 100) / 100;
}

/**
 * Convierte decimal a horas y minutos
 * Ejemplo: 5.42 → { horas: 5, minutos: 25 }
 */
export function decimalToHorasMinutos(decimal: number): {
  horas: number;
  minutos: number;
} {
  const totalMinutes = Math.round(decimal * 60);
  const horas = Math.floor(totalMinutes / 60);
  const minutos = Math.round((totalMinutes % 60) / 5) * 5; // round to nearest 5
  return { horas, minutos };
}
