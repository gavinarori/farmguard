const API_BASE = 'https://api.weather-ai.co/v1';
const API_KEY = process.env.WEATHER_AI_KEY!;

function headers(extra: Record<string, string> = {}) {
  return {
    Authorization: `Bearer ${API_KEY}`,
    ...extra,
  };
}

export async function weatherAI<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...headers(),
      ...(options?.headers || {}),
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || json.error || `HTTP ${res.status}`);
  }

  return json;
}