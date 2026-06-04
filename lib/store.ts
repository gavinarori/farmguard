import { create } from 'zustand';

export interface WeatherData {
  location: {
    latitude: number;
    longitude: number;
    name: string;
    country?: string;
  };
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    uvIndex: number;
  };
  forecast: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    condition: string;
    precipitation: number;
  }>;
  hourly: Array<{
    time: string;
    temperature: number;
    condition: string;
    humidity: number;
  }>;
}

export interface TreeAnalysis {
  id: string;
  timestamp: string;
  imageUrl: string;
  health: 'healthy' | 'diseased' | 'stressed';
  confidence: number;
  observations: string[];
  recommendations: string[];
}

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
  favorites: string[];
  addFavorite: (locationName: string) => void;
  removeFavorite: (locationName: string) => void;

  // API Quota
  quotaUsed: number;
  quotaLimit: number;
  setQuota: (used: number, limit: number) => void;
}

export const useStore = create<AppState>((set) => ({
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
    set((state) => ({ analyses: [analysis, ...state.analyses] })),
  clearAnalyses: () => set({ analyses: [] }),

  // Settings
  isCelsius: true,
  toggleTemperatureUnit: () =>
    set((state) => ({ isCelsius: !state.isCelsius })),
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  favorites: [],
  addFavorite: (locationName) =>
    set((state) => {
      if (!state.favorites.includes(locationName)) {
        return { favorites: [...state.favorites, locationName] };
      }
      return state;
    }),
  removeFavorite: (locationName) =>
    set((state) => ({
      favorites: state.favorites.filter((fav) => fav !== locationName),
    })),

  // API Quota
  quotaUsed: 0,
  quotaLimit: 100,
  setQuota: (used, limit) => set({ quotaUsed: used, quotaLimit: limit }),
}));
