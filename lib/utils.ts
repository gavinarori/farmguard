import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formating an ISO date string to a short readable label */
export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

/** Format an ISO datetime or "YYYY-MM-DD HH:mm" string to HH:MM AM/PM */
export function formatTime(raw: string): string {
  try {
    const d = raw.includes('T') ? new Date(raw) : new Date(raw.replace(' ', 'T'));
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return raw;
  }
}

/** Picking the right weather emoji for a condition string */
export function weatherEmoji(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes('thunder') || c.includes('storm')) return '⛈️';
  if (c.includes('drizzle') || c.includes('shower')) return '🌦️';
  if (c.includes('rain'))                             return '🌧️';
  if (c.includes('snow') || c.includes('sleet'))     return '❄️';
  if (c.includes('fog') || c.includes('mist'))       return '🌫️';
  if (c.includes('overcast'))                         return '☁️';
  if (c.includes('cloud') || c.includes('cloudy'))   return '⛅';
  if (c.includes('clear') || c.includes('sunny'))    return '☀️';
  return '🌤️';
}

/** Convert Celsius → Fahrenheit */
export function toF(c: number): number {
  return Math.round(c * 9 / 5 + 32);
}

/** Display temperature with the right unit symbol */
export function displayTemp(celsius: number, isCelsius: boolean): string {
  return isCelsius ? `${Math.round(celsius)}°C` : `${toF(celsius)}°F`;
}