import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an ISO date string to a short readable label */
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

/**
 * Format an ISO datetime or "YYYY-MM-DD HH:mm" string to a friendly time.
 */
export function formatTime(raw: string): string {
  try {
    const d = raw.includes('T')
      ? new Date(raw)
      : new Date(raw.replace(' ', 'T'));

    const h = d.getHours();
    const m = d.getMinutes();

    if (h === 0 && m === 0) return 'Midnight';
    if (h === 12 && m === 0) return 'Noon';

    const period = h < 12 ? 'AM' : 'PM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;

    if (m === 0) return `${hour12} ${period}`;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  } catch {
    return raw;
  }
}

/**
 * Determine if a given time is night.
 * Default: current local time.
 */
export function isNightTime(date?: Date): boolean {
  const now = date ?? new Date();
  const hour = now.getHours();

  // Night between 6 PM and 6 AM
  return hour >= 18 || hour < 6;
}

/**
 * Weather emoji helper.
 * Pass isNight=true for current conditions after sunset.
 */
export function weatherEmoji(
  condition: string | number,
  isNight = false
): string {
  // Handle WMO codes
  if (typeof condition === 'number' || /^\d+$/.test(String(condition))) {
    const code = Number(condition);

    if (code === 0) return isNight ? '🌙' : '☀️';

    if (code <= 2) return isNight ? '☁️🌙' : '🌤️';

    if (code === 3) return '☁️';

    if (code >= 45 && code <= 48) return '🌫️';

    if (code >= 51 && code <= 57) return '🌦️';

    if (code >= 61 && code <= 67) return '🌧️';

    if (code >= 71 && code <= 77) return '❄️';

    if (code >= 80 && code <= 82) return '🌦️';

    if (code >= 85 && code <= 86) return '❄️';

    if (code >= 95) return '⛈️';

    return isNight ? '☁️🌙' : '🌤️';
  }

  const c = String(condition).toLowerCase();

  if (c.includes('thunder') || c.includes('storm')) return '⛈️';

  if (c.includes('drizzle') || c.includes('shower')) return '🌦️';

  if (c.includes('rain')) return '🌧️';

  if (c.includes('snow') || c.includes('sleet')) return '❄️';

  if (c.includes('fog') || c.includes('mist')) return '🌫️';

  if (c.includes('overcast')) return '☁️';

  if (c.includes('cloud') || c.includes('cloudy')) {
    return isNight ? '☁️🌙' : '⛅';
  }

  if (c.includes('clear') || c.includes('sunny')) {
    return isNight ? '🌙' : '☀️';
  }

  return isNight ? '☁️🌙' : '🌤️';
}

/** Convert Celsius → Fahrenheit */
export function toF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

/** Display temperature with the correct unit */
export function displayTemp(
  celsius: number,
  isCelsius: boolean
): string {
  return isCelsius
    ? `${Math.round(celsius)}°C`
    : `${toF(celsius)}°F`;
}

/**
 * Build weather summary text.
 */
export function buildTodaySummary(
  current: {
    temperature: number;
    feelsLike: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    uvIndex: number;
  },
  isCelsius: boolean,
  locationName?: string
): string {
  const temp = displayTemp(current.temperature, isCelsius);
  const feels = displayTemp(current.feelsLike, isCelsius);

  const condition = current.condition || 'Clear';

  const where =
    locationName && locationName !== 'Unknown'
      ? ` in ${locationName}`
      : '';

  const uvNote =
    current.uvIndex >= 8
      ? 'UV is very high — wear sunscreen if going out.'
      : current.uvIndex >= 5
      ? 'Moderate UV levels today.'
      : current.uvIndex >= 3
      ? 'UV is low, no special precautions needed.'
      : '';

  const windNote =
    current.windSpeed >= 40
      ? 'Strong winds expected — secure loose items.'
      : current.windSpeed >= 20
      ? 'Breezy conditions today.'
      : '';

  const humidNote =
    current.humidity >= 85
      ? 'High humidity — it may feel muggy.'
      : current.humidity <= 30
      ? 'Air is dry today.'
      : '';

  const extras = [uvNote, windNote, humidNote]
    .filter(Boolean)
    .join(' ');

  return `Today${where} it's ${temp} with ${condition.toLowerCase()} skies — feels like ${feels}. ${extras}`.trim();
}