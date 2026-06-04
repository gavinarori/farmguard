const API_BASE = 'https://api.weather-ai.co/v1';
const API_KEY = process.env.NEXT_PUBLIC_WEATHER_AI_KEY ?? '';

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    Authorization: `Bearer ${API_KEY}`,
    ...extra,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message ?? json.error ?? `HTTP ${res.status}`);
  }
  // API returns the payload directly (not wrapped in {success, data})
  return json as T;
}

// ─── Weather ──────────────────────────────────────────────────

export async function getWeather(
  latitude: number,
  longitude: number,
  days = 7,
  lang: 'en' | 'sw' = 'en',
  units: 'metric' | 'imperial' = 'metric'
) {
  const res = await fetch(
    `${API_BASE}/weather?lat=${latitude}&lon=${longitude}&days=${days}&ai=true&units=${units}&lang=${lang}`,
    { headers: authHeaders() }
  );
  return handleResponse<any>(res);
}

export async function getWeatherByCity(
  cityName: string,
  days = 7,
  lang: 'en' | 'sw' = 'en',
  units: 'metric' | 'imperial' = 'metric'
) {
  const res = await fetch(
    `${API_BASE}/weather?city=${encodeURIComponent(cityName)}&days=${days}&ai=true&units=${units}&lang=${lang}`,
    { headers: authHeaders() }
  );
  return handleResponse<any>(res);
}

// Skip AI summary to preserve quota when only refreshing current conditions
export async function getCurrentWeather(latitude: number, longitude: number) {
  const res = await fetch(
    `${API_BASE}/current?lat=${latitude}&lon=${longitude}&ai=false`,
    { headers: authHeaders() }
  );
  return handleResponse<any>(res);
}

// ─── Trees / Forestry ─────────────────────────────────────────

/**
 * Analyze a farm image for tree health.
 * Uses multipart/form-data as required by POST /v1/trees/analyze.
 */
export async function analyzeTree(
  imageFile: File,
  meta?: {
    farmerId?: string;
    county?: string;
    landAcres?: number;
    location?: string;
    notes?: string;
  }
) {
  const form = new FormData();
  form.append('image', imageFile);
  if (meta?.farmerId)  form.append('farmerId',  meta.farmerId);
  if (meta?.county)    form.append('county',    meta.county);
  if (meta?.landAcres) form.append('landAcres', String(meta.landAcres));
  if (meta?.location)  form.append('location',  meta.location);
  if (meta?.notes)     form.append('notes',     meta.notes);

  const res = await fetch(`${API_BASE}/trees/analyze`, {
    method: 'POST',
    headers: authHeaders(), // No Content-Type — let fetch set multipart boundary
    body: form,
  });
  return handleResponse<any>(res);
}

export async function getAnalysisHistory(limit = 20, cursor?: string) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  const res = await fetch(`${API_BASE}/trees/history?${params}`, {
    headers: authHeaders(),
  });
  return handleResponse<any>(res);
}

export async function getQuotaUsage() {
  const res = await fetch(`${API_BASE}/trees/quota`, {
    headers: authHeaders(),
  });
  return handleResponse<any>(res);
}

// ─── Account ──────────────────────────────────────────────────

export async function getUsageStats() {
  const res = await fetch(`${API_BASE}/usage`, {
    headers: authHeaders(),
  });
  return handleResponse<any>(res);
}