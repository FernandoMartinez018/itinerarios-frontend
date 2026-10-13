/** Utilidades de presentación de viajes (fechas locales y duraciones legibles). */

/** Interpreta 'yyyy-MM-dd' como fecha local (no UTC), para que no se corra un día. */
export function parseTravelDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatTravelDate(isoDate: string, style: 'long' | 'short' = 'long'): string {
  return parseTravelDate(isoDate).toLocaleDateString('es-CO', style === 'long'
    ? { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }
    : { day: 'numeric', month: 'short' });
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** Días desde hoy hasta la fecha del viaje (0 = hoy, negativo = ya pasó). */
export function daysUntil(isoDate: string, today: Date = new Date()): number {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((parseTravelDate(isoDate).getTime() - start.getTime()) / 86_400_000);
}

export function daysUntilLabel(isoDate: string, today: Date = new Date()): string {
  const days = daysUntil(isoDate, today);
  if (days === 0) return 'Hoy';
  if (days === 1) return 'Mañana';
  if (days < 0) return 'Realizado';
  return `En ${days} días`;
}
