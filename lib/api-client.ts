const API_BASE = '/api/weather-ai';

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || json.error || `HTTP ${res.status}`);
  }

  return json;
}



// ─── Weather ─────────────────────────────────────

export async function getWeather(
  latitude: number,
  longitude: number,
  days = 7,
  lang: 'en' | 'sw' = 'en',
  units: 'metric' | 'imperial' = 'metric'
) {
  const res = await fetch(
    `${API_BASE}/weather?lat=${latitude}&lon=${longitude}&days=${days}&ai=true&units=${units}&lang=${lang}`
  );

  return handleResponse<any>(res);
}

export async function getCurrentWeather(lat: number, lon: number) {
  const res = await fetch(
    `${API_BASE}/current?lat=${lat}&lon=${lon}`
  );

  return handleResponse<any>(res);
}

export async function getWeatherByCity(city: string) {
  const res = await fetch(
    `${API_BASE}/weather?city=${encodeURIComponent(city)}`
  );

  return handleResponse<any>(res);
}

// ─── Trees ─────────────────────────────────────

export async function getQuotaUsage() {
  const res = await fetch(`${API_BASE}/trees/quota`);
  return handleResponse<any>(res);
}

export async function getAnalysisHistory(limit = 20, cursor?: string) {
  const res = await fetch(
    `${API_BASE}/trees/history?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`
  );

  return handleResponse<any>(res);
}

export async function analyzeTree(file: File, meta?: any) {
  const form = new FormData();
  form.append('image', file);

  if (meta) {
    Object.entries(meta).forEach(([k, v]) => {
      if (v !== undefined) form.append(k, String(v));
    });
  }

  const res = await fetch(`${API_BASE}/trees/analyze`, {
    method: 'POST',
    body: form,
  });

  return handleResponse<any>(res);
}

// ─── Account ─────────────────────────────────────

export async function getUsageStats() {
  const res = await fetch(`${API_BASE}/usage`);
  return handleResponse<any>(res);
}