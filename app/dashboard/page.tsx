'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { getWeather, getWeatherByCity } from '@/lib/api-client';
import { WeatherCard } from '@/components/weather-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, MapPin, Search, Star, Cloud, Clock } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const {
    weatherData,
    setWeatherData,
    loading,
    setLoading,
    error,
    setError,
    location,
    setLocation,
    favorites,
    addFavorite,
    removeFavorite,
  } = useStore();

  const [searchInput, setSearchInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [forecastView, setForecastView] = useState<'daily' | 'hourly'>('daily');

  // Get user location on mount
  useEffect(() => {
    if (!location) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ lat: latitude, lng: longitude });
            await fetchWeather(latitude, longitude);
          },
          (err) => {
            console.error('[v0] Geolocation error:', err);
            // Fallback to default location
            setLocation({ lat: -1.9536, lng: 29.8739 }); // Kigali, Rwanda
            fetchWeather(-1.9536, 29.8739);
          }
        );
      }
    }
  }, []);

  // Fetch weather when location changes
  useEffect(() => {
    if (location && !weatherData) {
      fetchWeather(location.lat, location.lng);
    }
  }, [location]);

  // Update favorite status
  useEffect(() => {
    if (weatherData) {
      setIsFavorite(favorites.includes(weatherData.location.name));
    }
  }, [weatherData, favorites]);

  const fetchWeather = async (lat: number, lng: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getWeather(lat, lng);
      setWeatherData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather data');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getWeatherByCity(searchInput);
      setWeatherData(data);
      setLocation({
        lat: data.location.latitude,
        lng: data.location.longitude,
      });
    } catch (err: any) {
      setError(err.message || 'City not found');
    } finally {
      setLoading(false);
      setSearchInput('');
    }
  };

  const handleToggleFavorite = () => {
    if (weatherData) {
      if (isFavorite) {
        removeFavorite(weatherData.location.name);
      } else {
        addFavorite(weatherData.location.name);
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">FarmGuard Free</h1>
            <p className="text-gray-600 mt-1">
              Weather & Tree Health Dashboard
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/analyze">
              <Button className="bg-green-600 hover:bg-green-700">
                Analyze Tree
              </Button>
            </Link>
            <Link href="/history">
              <Button variant="outline">History</Button>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for a city..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <Button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            <Search className="w-4 h-4" />
          </Button>
        </form>

        {/* Error Message */}
        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Loading weather data...</span>
          </div>
        )}

        {/* Weather Data */}
        {weatherData && !loading && (
          <>
            {/* Location Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {weatherData.location.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {weatherData.location.country || 'Location'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleToggleFavorite}
                className={
                  isFavorite ? 'border-yellow-500 text-yellow-600' : ''
                }
              >
                <Star
                  className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`}
                />
              </Button>
            </div>

            {/* Current Weather */}
            <WeatherCard
              temperature={weatherData.current.temperature}
              condition={weatherData.current.condition}
              humidity={weatherData.current.humidity}
              windSpeed={weatherData.current.windSpeed}
              uvIndex={weatherData.current.uvIndex}
              visibilityKm={10}
            />

            {/* Forecast Toggle and View */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {forecastView === 'daily' ? 'Daily Forecast' : 'Hourly Forecast'}
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setForecastView('daily')}
                    variant={forecastView === 'daily' ? 'default' : 'outline'}
                    className={`flex items-center gap-2 ${
                      forecastView === 'daily'
                        ? 'bg-green-600 hover:bg-green-700'
                        : ''
                    }`}
                  >
                    <Cloud className="w-4 h-4" />
                    Daily
                  </Button>
                  <Button
                    onClick={() => setForecastView('hourly')}
                    variant={forecastView === 'hourly' ? 'default' : 'outline'}
                    className={`flex items-center gap-2 ${
                      forecastView === 'hourly'
                        ? 'bg-green-600 hover:bg-green-700'
                        : ''
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    Hourly
                  </Button>
                </div>
              </div>

              {/* Daily Forecast View */}
              {forecastView === 'daily' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 overflow-x-auto">
                  {weatherData.forecast.map((day, idx) => (
                    <WeatherCard
                      key={idx}
                      isForecast
                      date={day.date}
                      maxTemp={Math.round(day.maxTemp)}
                      minTemp={Math.round(day.minTemp)}
                      condition={day.condition}
                      precipitation={day.precipitation}
                    />
                  ))}
                </div>
              )}

              {/* Hourly Forecast View */}
              {forecastView === 'hourly' && (
                <div className="overflow-x-auto pb-2">
                  <div className="flex gap-3">
                    {weatherData.hourly.slice(0, 24).map((hour, idx) => (
                      <Card
                        key={idx}
                        className="flex-shrink-0 p-4 text-center min-w-28 bg-white border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          {hour.time}
                        </p>
                        <p className="text-xl font-bold text-gray-900 mb-2">
                          {Math.round(hour.temperature)}°
                        </p>
                        <p className="text-xs text-gray-500 mb-2">{hour.condition}</p>
                        <div className="flex items-center justify-center gap-1 text-xs text-blue-600">
                          <span>💧 {hour.humidity}%</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !weatherData && !error && (
          <Card className="p-8 text-center bg-white">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              Waiting for location data...
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}
