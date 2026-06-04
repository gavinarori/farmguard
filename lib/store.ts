import { create } from 'zustand';
import { persist } from 'zustand/middleware';



export interface WeatherData {
  location: {
    lat: number;
    lon: number;
    name: string;
    country?: string;
  };
  current: {
    temperature: number;  
    feelsLike: number;     
    condition: string;     
    humidity: number;
    windSpeed: number;    
    uvIndex: number;       
    precipMm: number;      
    visibilityKm: number;  
  };
  forecast: Array<{
    date: string;
    maxTemp: number;       
    minTemp: number;       
    condition: string;
    precipitation: number; 
    humidity: number;
    uvIndex: number;
  }>;
  hourly: Array<{
    time: string;
    temperature: number;   
    condition: string;
    humidity: number;
    precipMm: number;
    windKph: number;
  }>;
  aiSummary?: string;      
}

// Normalize raw API response → WeatherData
export function normalizeWeather(raw: any): WeatherData {
  const loc = raw.location ?? {};
  const cur = raw.current ?? {};

  // forecast: WeatherAI returns forecast.forecastday[] or a flat forecast[]
  const forecastDays: any[] =
    raw.forecast?.forecastday ?? raw.forecast ?? raw.daily ?? [];

  const forecast = forecastDays.map((d: any) => {
    const day = d.day ?? d;
    return {
      date: d.date ?? d.date_epoch ?? '',
      maxTemp: day.maxtemp_c ?? day.max_temp_c ?? day.maxTemp ?? 0,
      minTemp: day.mintemp_c ?? day.min_temp_c ?? day.minTemp ?? 0,
      condition:
        day.condition?.text ?? day.condition ?? day.condition_text ?? '',
      precipitation:
        day.totalprecip_mm ?? day.total_precip_mm ?? day.precipitation ?? 0,
      humidity: day.avghumidity ?? day.humidity ?? 0,
      uvIndex: day.uv ?? day.uv_index ?? day.uvIndex ?? 0,
    };
  });

  // hourly: flatten from forecastday[].hour[] or raw.hourly[]
  let hourly: WeatherData['hourly'] = [];
  if (raw.hourly && Array.isArray(raw.hourly)) {
    hourly = raw.hourly.map((h: any) => ({
      time: h.time ?? '',
      temperature: h.temp_c ?? h.temperature ?? 0,
      condition: h.condition?.text ?? h.condition ?? h.condition_text ?? '',
      humidity: h.humidity ?? 0,
      precipMm: h.precip_mm ?? h.precipMm ?? 0,
      windKph: h.wind_kph ?? h.windKph ?? 0,
    }));
  } else if (forecastDays.length > 0) {
    (forecastDays[0]?.hour ?? []).forEach((h: any) => {
      hourly.push({
        time: h.time ?? '',
        temperature: h.temp_c ?? 0,
        condition: h.condition?.text ?? h.condition ?? '',
        humidity: h.humidity ?? 0,
        precipMm: h.precip_mm ?? 0,
        windKph: h.wind_kph ?? 0,
      });
    });
  }

  return {
    location: {
      lat: loc.lat ?? 0,
      lon: loc.lon ?? loc.lng ?? 0,
      name: loc.name ?? loc.city ?? 'Unknown',
      country: loc.country ?? loc.region ?? undefined,
    },
    current: {
      temperature: cur.temp_c ?? cur.temperature ?? 0,
      feelsLike: cur.feelslike_c ?? cur.feels_like ?? cur.temp_c ?? 0,
      condition: cur.condition?.text ?? cur.condition ?? cur.condition_text ?? 'Clear',
      humidity: cur.humidity ?? 0,
      windSpeed: cur.wind_kph ?? cur.windSpeed ?? 0,
      uvIndex: cur.uv ?? cur.uv_index ?? cur.uvIndex ?? 0,
      precipMm: cur.precip_mm ?? 0,
      visibilityKm: cur.vis_km ?? cur.visibilityKm ?? 10,
    },
    forecast,
    hourly,
    aiSummary:
      raw.ai_summary ?? raw.summary ?? raw.aiSummary ?? undefined,
  };
}

// ─── Tree Analysis ────────────────────────────────────────────

export interface TreeAnalysis {
  id: string;
  timestamp: string;
  imageUrl: string;          
  overlayUrl?: string;       
  health: 'healthy' | 'diseased' | 'stressed';
  confidence: number;
  treeCount?: number;
  densityPerAcre?: number;
  canopyCoveragePct?: number;
  speciesGuess?: string;
  treeHealth?: {
    healthy: number;
    needsCare: number;
    needsReplacement: number;
  };
  observations: string[];
  recommendations: string[];
  location?: string;
  county?: string;
  farmerId?: string;
}

export function normalizeAnalysis(raw: any, blobUrl?: string): TreeAnalysis {
  const h = raw.tree_health ?? {};
  const total = raw.total_tree_count ?? 0;
  const healthyCount = h.healthy ?? 0;
  const needsCareCount = h.needs_care ?? 0;
  const needsReplacementCount = h.needs_replacement ?? 0;
  const ratio = total > 0 ? healthyCount / total : 1;
  const health: TreeAnalysis['health'] =
    ratio >= 0.75 ? 'healthy' : ratio >= 0.4 ? 'stressed' : 'diseased';

  return {
    id: raw.analysis_id ?? `local-${Date.now()}`,
    timestamp: raw.timestamp ?? new Date().toISOString(),
    imageUrl: blobUrl ?? raw.original_image_url ?? '',
    overlayUrl: raw.overlay_image_url ?? undefined,
    health,
    confidence: raw.confidence_score ?? 0.85,
    treeCount: raw.total_tree_count ?? undefined,
    densityPerAcre: raw.tree_density_per_acre ?? undefined,
    canopyCoveragePct: raw.canopy_coverage_pct ?? undefined,
    speciesGuess: raw.tree_species_guess ?? undefined,
    treeHealth:
      total > 0
        ? {
            healthy: healthyCount,
            needsCare: needsCareCount,
            needsReplacement: needsReplacementCount,
          }
        : undefined,
    observations: raw.observations ?? [],
    recommendations: raw.recommendations ?? [],
    location: raw.location ?? undefined,
    county: raw.county ?? undefined,
    farmerId: raw.farmer_id ?? undefined,
  };
}

// ─── Zustand Store ────────────────────────────────────────────

export interface AppState {
  // Weather
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
  setWeatherData: (data: WeatherData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Location
  location: { lat: number; lng: number } | null;
  setLocation: (location: { lat: number; lng: number } | null) => void;

  // Tree Analysis
  analyses: TreeAnalysis[];
  addAnalysis: (analysis: TreeAnalysis) => void;
  clearAnalyses: () => void;

  // Settings
  isCelsius: boolean;
  toggleTemperatureUnit: () => void;
  language: 'en' | 'sw';
  setLanguage: (lang: 'en' | 'sw') => void;

  // Favourites
  favorites: string[];
  addFavorite: (locationName: string) => void;
  removeFavorite: (locationName: string) => void;

  // API Quota
  quotaUsed: number;
  quotaLimit: number;
  quotaRemaining: number;
  setQuota: (used: number, limit: number, remaining: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Weather
      weatherData: null,
      loading: false,
      error: null,
      setWeatherData: (data) => set({ weatherData: data }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Location
      location: null,
      setLocation: (location) => set({ location }),

      // Tree Analysis
      analyses: [],
      addAnalysis: (analysis) =>
        set((state) => ({
          analyses: [analysis, ...state.analyses].slice(0, 50),
        })),
      clearAnalyses: () => set({ analyses: [] }),

      // Settings
      isCelsius: true,
      toggleTemperatureUnit: () =>
        set((state) => ({ isCelsius: !state.isCelsius })),
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),

      // Favourites
      favorites: [],
      addFavorite: (locationName) =>
        set((state) =>
          state.favorites.includes(locationName)
            ? state
            : { favorites: [...state.favorites, locationName] }
        ),
      removeFavorite: (locationName) =>
        set((state) => ({
          favorites: state.favorites.filter((f) => f !== locationName),
        })),

      // Quota
      quotaUsed: 0,
      quotaLimit: 5,
      quotaRemaining: 5,
      setQuota: (used, limit, remaining) =>
        set({ quotaUsed: used, quotaLimit: limit, quotaRemaining: remaining }),
    }),
    {
      name: 'farmguard-store',
      // Persist everything except ephemeral UI state
      partialize: (state) => ({
        analyses: state.analyses,
        favorites: state.favorites,
        isCelsius: state.isCelsius,
        language: state.language,
        location: state.location,
      }),
    }
  )
);