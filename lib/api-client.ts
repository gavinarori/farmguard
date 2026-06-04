
const API_BASE = '/api/weather-ai';

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || json.error || `HTTP ${res.status}`);
  }

  return json;
}





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

/**
 * Search weather by city name.
 * Uses the Nominatim geocoding API to resolve city → lat/lon,
 * then fetches weather for those coordinates.
 */
export async function getWeatherByCity(city: string) {
  // Step 1: geocode the city name to lat/lon via OpenStreetMap Nominatim
  const geoRes = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
    { headers: { 'Accept-Language': 'en', 'User-Agent': 'FarmGuard/1.0' } }
  );

  if (!geoRes.ok) {
    throw new Error('Could not reach geocoding service. Please try again.');
  }

  const geoData = await geoRes.json();

  if (!geoData || geoData.length === 0) {
    throw new Error(`City "${city}" not found. Try a different spelling or add the country (e.g. "Kisumu, Kenya").`);
  }

  const { lat, lon, display_name } = geoData[0];

  // Step 2: fetch weather using resolved coordinates
  const res = await fetch(
    `${API_BASE}/weather?lat=${lat}&lon=${lon}&days=7&ai=true&units=metric&cityName=${encodeURIComponent(display_name)}`
  );

  const data = await handleResponse<any>(res);

  // Inject a friendly location name derived from geocoding
  // so normalizeWeather can pick it up
  const shortName = display_name.split(',').slice(0, 2).join(', ');
  if (data.location) {
    data.location.name = shortName;
    data.location.resolvedCity = shortName;
  } else {
    data.location = { lat: parseFloat(lat), lon: parseFloat(lon), name: shortName };
  }

  return data;
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
