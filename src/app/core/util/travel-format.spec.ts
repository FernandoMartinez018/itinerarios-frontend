import { daysUntil, daysUntilLabel, formatDuration, parseTravelDate } from './travel-format';

describe('travel-format', () => {
  const today = new Date(2026, 9, 13); // 13-oct-2026, hora local

  it('interpreta la fecha ISO como fecha local (sin correrse un dia por UTC)', () => {
    const d = parseTravelDate('2026-12-24');
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 11, 24]);
  });

  it('formatea duraciones legibles', () => {
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(60)).toBe('1 h');
    expect(formatDuration(135)).toBe('2 h 15 min');
  });

  it('calcula los dias hasta el viaje y su etiqueta', () => {
    expect(daysUntil('2026-10-13', today)).toBe(0);
    expect(daysUntilLabel('2026-10-14', today)).toBe('Mañana');
    expect(daysUntilLabel('2026-10-20', today)).toBe('En 7 días');
    expect(daysUntilLabel('2026-10-01', today)).toBe('Realizado');
  });
});
