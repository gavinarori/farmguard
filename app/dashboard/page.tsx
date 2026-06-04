'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  MapPin, Search, Star, Cloud, Clock,
  Loader2, RefreshCw, Languages, TreePine, ChevronRight,
} from 'lucide-react';

import { useStore, normalizeWeather } from '@/lib/store';
import { getWeather, getWeatherByCity } from '@/lib/api-client';
import { weatherEmoji, displayTemp } from '@/lib/utils';
import {
  CurrentWeatherCard,
  ForecastCard,
  HourlyCard,
} from '@/components/weather-card';

type ForecastView = 'daily' | 'hourly';

export default function DashboardPage() {
  const {
    weatherData, setWeatherData,
    loading, setLoading,
    error, setError,
    location, setLocation,
    isCelsius, toggleTemperatureUnit,
    language, setLanguage,
    favorites, addFavorite, removeFavorite,
  } = useStore();

  const [searchInput, setSearchInput] = useState('');
  const [forecastView, setForecastView] = useState<ForecastView>('daily');

  const isFavorite = weatherData ? favorites.includes(weatherData.location.name) : false;

  const fetchByCoords = useCallback(async (lat: number, lng: number) => {
    setLoading(true); setError(null);
    try {
      const raw = await getWeather(lat, lng, 7, language);
      setWeatherData(normalizeWeather(raw));
      setLocation({ lat, lng });
    } catch (e: any) {
      setError(e.message ?? 'Failed to fetch weather');
      setWeatherData(null);
    } finally { setLoading(false); }
  }, [language, setError, setLoading, setLocation, setWeatherData]);

  const fetchByCity = useCallback(async (city: string) => {
    setLoading(true); setError(null);
    try {
      const raw = await getWeatherByCity(city, 7, language);
      const normalized = normalizeWeather(raw);
      setWeatherData(normalized);
      setLocation({ lat: normalized.location.lat, lng: normalized.location.lon });
    } catch (e: any) {
      setError(e.message ?? 'City not found');
    } finally { setLoading(false); }
  }, [language, setError, setLoading, setLocation, setWeatherData]);

  useEffect(() => {
    if (weatherData) return;
    if (location) { fetchByCoords(location.lat, location.lng); return; }
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
        () => fetchByCoords(-1.2921, 36.8219)
      );
    } else { fetchByCoords(-1.2921, 36.8219); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!location) return;
    fetchByCoords(location.lat, location.lng);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (!q) return;
    fetchByCity(q);
    setSearchInput('');
  };

  const handleToggleFavorite = () => {
    if (!weatherData) return;
    isFavorite ? removeFavorite(weatherData.location.name) : addFavorite(weatherData.location.name);
  };

  return (
    <div className="app-bg" style={{ minHeight: '100vh' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Top Nav ───────────────────────────────────────────── */}
        <nav className="nav-bar">
          <div
            style={{
              maxWidth: '1100px',
              margin: '0 auto',
              padding: '0 1.5rem',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Wordmark */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #5cad6e, #3d7a4e)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TreePine style={{ width: '15px', height: '15px', color: '#0b0f0d' }} />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: 'var(--col-text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                Farm<span style={{ color: 'var(--col-green)' }}>Guard</span>
              </span>
            </div>

            {/* Nav actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                className="btn btn-ghost"
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
              >
                <Languages style={{ width: '0.85rem', height: '0.85rem' }} />
                {language === 'en' ? 'EN' : 'SW'}
              </button>
              <button
                className="btn btn-ghost"
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
                onClick={toggleTemperatureUnit}
              >
                °{isCelsius ? 'C' : 'F'}
              </button>
              <Link href="/history">
                <button className="btn btn-ghost" style={{ fontSize: '0.78rem', padding: '0.4rem 0.9rem' }}>
                  History
                </button>
              </Link>
              <Link href="/analyze">
                <button className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }}>
                  <TreePine style={{ width: '0.85rem', height: '0.85rem' }} />
                  Analyze Tree
                </button>
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Main Content ─────────────────────────────────────── */}
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Page title + search */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
                  fontWeight: 900,
                  color: 'var(--col-text-primary)',
                  marginBottom: '0.2rem',
                  lineHeight: 1.1,
                }}
              >
                Weather Dashboard
              </h1>
              <p style={{ fontSize: '0.83rem', color: 'var(--col-text-muted)' }}>
                Real-time conditions & farm advisory
              </p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: '0 0 auto' }}>
              <div style={{ position: 'relative' }}>
                <Search
                  style={{
                    position: 'absolute',
                    left: '0.7rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '0.85rem',
                    height: '0.85rem',
                    color: 'var(--col-text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search city…"
                  className="field"
                  style={{ paddingLeft: '2rem', width: '200px', fontSize: '0.82rem' }}
                />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '0.55rem 0.9rem' }}>
                <Search style={{ width: '0.85rem', height: '0.85rem' }} />
              </button>
              {location && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: '0.55rem 0.75rem' }}
                  onClick={() => fetchByCoords(location.lat, location.lng)}
                  disabled={loading}
                  title="Refresh"
                >
                  <RefreshCw style={{ width: '0.85rem', height: '0.85rem' }} />
                </button>
              )}
            </form>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: 'rgba(192,92,92,0.1)',
                border: '1px solid rgba(192,92,92,0.25)',
                borderRadius: 'var(--r-md)',
                fontSize: '0.83rem',
                color: '#c05c5c',
              }}
            >
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '4rem 0', color: 'var(--col-text-muted)' }}>
              <Loader2 style={{ width: '1.4rem', height: '1.4rem', color: 'var(--col-green)' }} className="animate-spin" />
              <span style={{ fontSize: '0.85rem' }}>Loading weather data…</span>
            </div>
          )}

          {/* Weather Content */}
          {weatherData && !loading && (
            <>
              {/* Location row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <MapPin style={{ width: '1rem', height: '1rem', color: 'var(--col-green)', flexShrink: 0 }} />
                  <div>
                    <h2
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.35rem',
                        fontWeight: 700,
                        color: 'var(--col-text-primary)',
                        lineHeight: 1.1,
                      }}
                    >
                      {weatherData.location.name}
                    </h2>
                    {weatherData.location.country && (
                      <p style={{ fontSize: '0.72rem', color: 'var(--col-text-muted)' }}>
                        {weatherData.location.country}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  className={isFavorite ? 'btn btn-amber' : 'btn btn-ghost'}
                  style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem' }}
                  onClick={handleToggleFavorite}
                >
                  <Star style={{ width: '0.85rem', height: '0.85rem', fill: isFavorite ? 'currentColor' : 'none' }} />
                  {isFavorite ? 'Saved' : 'Save location'}
                </button>
              </div>

              {/* AI Advisory */}
              {weatherData.aiSummary && (
                <div
                  style={{
                    background: 'var(--col-surface)',
                    border: '1px solid rgba(92,173,110,0.2)',
                    borderRadius: 'var(--r-xl)',
                    padding: '1.1rem 1.25rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'linear-gradient(90deg, var(--col-green), transparent)',
                    }}
                  />
                  <p className="section-label" style={{ color: 'var(--col-green)', marginBottom: '0.5rem' }}>
                    ✦ AI Farm Advisory
                  </p>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--col-text-secondary)' }}>
                    {weatherData.aiSummary}
                  </p>
                </div>
              )}

              {/* Current weather card */}
              <CurrentWeatherCard
                temperature={weatherData.current.temperature}
                feelsLike={weatherData.current.feelsLike}
                condition={weatherData.current.condition}
                humidity={weatherData.current.humidity}
                windSpeed={weatherData.current.windSpeed}
                uvIndex={weatherData.current.uvIndex}
                visibilityKm={weatherData.current.visibilityKm}
                precipMm={weatherData.current.precipMm}
              />

              {/* Forecast toggle */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: 'var(--col-text-primary)',
                  }}
                >
                  {forecastView === 'daily' ? '7-Day Forecast' : '24-Hour Forecast'}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    gap: '2px',
                    background: 'var(--col-surface-2)',
                    border: '1px solid var(--col-border)',
                    borderRadius: 'var(--r-lg)',
                    padding: '3px',
                  }}
                >
                  {(['daily', 'hourly'] as ForecastView[]).map((v) => (
                    <button
                      key={v}
                      onClick={() => setForecastView(v)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.35rem 0.85rem',
                        borderRadius: '8px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        fontFamily: 'var(--font-sans)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: forecastView === v ? 'var(--col-green)' : 'transparent',
                        color: forecastView === v ? '#0b0f0d' : 'var(--col-text-muted)',
                      }}
                    >
                      {v === 'daily'
                        ? <Cloud style={{ width: '0.8rem', height: '0.8rem' }} />
                        : <Clock style={{ width: '0.8rem', height: '0.8rem' }} />
                      }
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily forecast */}
              {forecastView === 'daily' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.6rem' }}>
                  {weatherData.forecast.slice(0, 7).map((day, i) => (
                    <ForecastCard key={i} {...day} />
                  ))}
                </div>
              )}

              {/* Hourly forecast */}
              {forecastView === 'hourly' && (
                <>
                  {weatherData.hourly.length > 0 ? (
                    <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', width: 'max-content' }}>
                        {weatherData.hourly.slice(0, 24).map((h, i) => (
                          <HourlyCard key={i} {...h} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '2rem',
                        textAlign: 'center',
                        background: 'var(--col-surface)',
                        border: '1px solid var(--col-border)',
                        borderRadius: 'var(--r-xl)',
                        fontSize: '0.85rem',
                        color: 'var(--col-text-muted)',
                      }}
                    >
                      Hourly data not available for this location
                    </div>
                  )}
                </>
              )}

              {/* Saved locations */}
              {favorites.length > 0 && (
                <div>
                  <p className="section-label" style={{ marginBottom: '0.6rem' }}>Saved Locations</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {favorites.map((fav) => (
                      <button
                        key={fav}
                        onClick={() => fetchByCity(fav)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.35rem 0.8rem',
                          borderRadius: '99px',
                          background: 'var(--col-surface)',
                          border: '1px solid var(--col-border)',
                          color: 'var(--col-text-secondary)',
                          fontSize: '0.78rem',
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--col-green-dim)';
                          (e.currentTarget as HTMLElement).style.color = 'var(--col-text-primary)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--col-border)';
                          (e.currentTarget as HTMLElement).style.color = 'var(--col-text-secondary)';
                        }}
                      >
                        <Star style={{ width: '0.7rem', height: '0.7rem', fill: 'var(--col-amber)', color: 'var(--col-amber)' }} />
                        {fav}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Empty state */}
          {!loading && !weatherData && !error && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '5rem 2rem',
                background: 'var(--col-surface)',
                border: '1px solid var(--col-border)',
                borderRadius: 'var(--r-2xl)',
                gap: '0.75rem',
              }}
            >
              <MapPin style={{ width: '2.5rem', height: '2.5rem', color: 'var(--col-text-muted)' }} />
              <p style={{ color: 'var(--col-text-muted)', fontSize: '0.9rem' }}>Detecting your location…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}