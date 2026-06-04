'use client';

import { CloudRain, Sun, Cloud, Wind, Droplets, Eye, Gauge, Thermometer } from 'lucide-react';
import { useStore } from '@/lib/store';
import { weatherEmoji, displayTemp, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

function WeatherIcon({ condition, size = 'md' }: { condition: string; size?: 'sm' | 'md' | 'lg' }) {
  const c = condition.toLowerCase();
  const sz = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' }[size];
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower'))
    return <CloudRain className={cn(sz, 'text-[#5b9bd5]')} />;
  if (c.includes('cloud') || c.includes('overcast'))
    return <Cloud className={cn(sz, 'text-[#8fa891]')} />;
  return <Sun className={cn(sz, 'text-[#d4934a]')} />;
}

interface CurrentWeatherCardProps {
  temperature: number;
  feelsLike?: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  visibilityKm?: number;
  precipMm?: number;
}

export function CurrentWeatherCard({
  temperature,
  feelsLike,
  condition,
  humidity,
  windSpeed,
  uvIndex,
  visibilityKm = 10,
  precipMm = 0,
}: CurrentWeatherCardProps) {
  const { isCelsius } = useStore();
  const displayT = (c: number) =>
    isCelsius ? Math.round(c) : Math.round(c * 9 / 5 + 32);
  const unit = isCelsius ? '°C' : '°F';

  const uvColor = uvIndex >= 8 ? 'text-[#c05c5c]' : uvIndex >= 3 ? 'text-[#d4934a]' : 'text-[#5cad6e]';

  return (
    <div className="card-surface overflow-hidden">
      {/* Top: big temp + condition */}
      <div
        className="p-6 pb-5 relative"
        style={{
          background: 'linear-gradient(135deg, #18201c 0%, #111714 100%)',
        }}
      >
        {/* Decorative glow */}
        <div
          className="pointer-events-none absolute -top-8 -right-8 h-48 w-48 rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(92,173,110,0.18), transparent 70%)' }}
        />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="section-label mb-3" style={{ color: 'var(--col-green)' }}>
              ◉ Current Conditions
            </p>
            <div className="flex items-end gap-1 leading-none">
              <span
                className="num"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(4rem, 10vw, 6rem)',
                  fontWeight: 900,
                  color: 'var(--col-text-primary)',
                  lineHeight: 1,
                }}
              >
                {displayT(temperature)}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '2rem',
                  fontWeight: 400,
                  color: 'var(--col-green)',
                  marginBottom: '0.4rem',
                }}
              >
                {unit}
              </span>
            </div>
            <p style={{ fontSize: '1.05rem', color: 'var(--col-text-primary)', marginTop: '0.3rem', fontWeight: 500 }}>
              {condition}
            </p>
            {feelsLike !== undefined && (
              <p className="num" style={{ fontSize: '0.8rem', color: 'var(--col-text-muted)', marginTop: '0.2rem' }}>
                Feels like {displayT(feelsLike)}{unit}
              </p>
            )}
          </div>
          <div style={{ fontSize: '4.5rem', lineHeight: 1, opacity: 0.9, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>
            {weatherEmoji(condition)}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4"
        style={{ borderTop: '1px solid var(--col-border)' }}
      >
        {[
          {
            icon: <Droplets className="h-3.5 w-3.5" />,
            label: 'Humidity',
            value: `${humidity}%`,
            color: '#5b9bd5',
          },
          {
            icon: <Wind className="h-3.5 w-3.5" />,
            label: 'Wind',
            value: `${Math.round(windSpeed)} km/h`,
            color: '#5cad6e',
          },
          {
            icon: <Gauge className="h-3.5 w-3.5" />,
            label: 'UV Index',
            value: String(uvIndex),
            color: uvIndex >= 8 ? '#c05c5c' : uvIndex >= 3 ? '#d4934a' : '#5cad6e',
          },
          {
            icon: <Eye className="h-3.5 w-3.5" />,
            label: 'Visibility',
            value: `${visibilityKm} km`,
            color: '#8fa891',
          },
        ].map(({ icon, label, value, color }, i) => (
          <div
            key={label}
            style={{
              padding: '1rem 1.2rem',
              borderRight: i < 3 ? '1px solid var(--col-border)' : undefined,
              borderTop: i >= 2 ? '1px solid var(--col-border)' : undefined,
            }}
            className={cn(i >= 2 ? 'sm:border-t-0' : '')}
          >
            <div className="flex items-center gap-1.5 mb-1.5" style={{ color, fontSize: '0.7rem' }}>
              {icon}
              <span className="section-label" style={{ color: 'var(--col-text-muted)' }}>{label}</span>
            </div>
            <p className="num" style={{ fontSize: '1.35rem', fontWeight: 700, color }}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ForecastCardProps {
  date: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  precipitation: number;
  uvIndex?: number;
}

export function ForecastCard({ date, maxTemp, minTemp, condition, precipitation, uvIndex }: ForecastCardProps) {
  const { isCelsius } = useStore();
  const convert = (c: number) =>
    isCelsius ? `${Math.round(c)}°` : `${Math.round(c * 9 / 5 + 32)}°`;

  return (
    <div
      className="card-elevated group"
      style={{
        padding: '0.9rem 0.7rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.4rem',
        transition: 'all 0.2s',
        cursor: 'default',
      }}
    >
      <p className="section-label">{formatDate(date)}</p>
      <div style={{ fontSize: '1.8rem', margin: '0.2rem 0' }}>{weatherEmoji(condition)}</div>
      <p style={{ fontSize: '0.7rem', color: 'var(--col-text-muted)', textAlign: 'center', lineHeight: 1.3 }}>
        {condition}
      </p>
      <div className="num" style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--col-text-primary)' }}>
        {convert(maxTemp)}
        <span style={{ color: 'var(--col-text-muted)', fontWeight: 400, margin: '0 2px' }}>/</span>
        <span style={{ color: 'var(--col-text-muted)', fontWeight: 400 }}>{convert(minTemp)}</span>
      </div>
      {precipitation > 0 && (
        <span className="tag tag-blue" style={{ fontSize: '0.62rem' }}>💧 {precipitation.toFixed(1)}mm</span>
      )}
    </div>
  );
}

interface HourlyCardProps {
  time: string;
  temperature: number;
  condition: string;
  humidity: number;
  precipMm?: number;
}

export function HourlyCard({ time, temperature, condition, humidity, precipMm = 0 }: HourlyCardProps) {
  const { isCelsius } = useStore();
  const tempDisplay = isCelsius
    ? `${Math.round(temperature)}°`
    : `${Math.round(temperature * 9 / 5 + 32)}°`;

  return (
    <div
      style={{
        minWidth: '72px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.75rem 0.5rem',
        background: 'var(--col-surface-2)',
        border: '1px solid var(--col-border)',
        borderRadius: 'var(--r-lg)',
        textAlign: 'center',
      }}
    >
      <p className="num section-label">{time}</p>
      <div style={{ fontSize: '1.4rem' }}>{weatherEmoji(condition)}</div>
      <p className="num" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--col-text-primary)' }}>
        {tempDisplay}
      </p>
      <p className="num" style={{ fontSize: '0.65rem', color: '#5b9bd5' }}>💧 {humidity}%</p>
    </div>
  );
}

/* Backward compat default export */
interface WeatherCardProps {
  isForecast?: boolean;
  date?: string;
  maxTemp?: number;
  minTemp?: number;
  condition?: string;
  precipitation?: number;
  temperature?: number;
  feelsLike?: number;
  humidity?: number;
  windSpeed?: number;
  uvIndex?: number;
  visibilityKm?: number;
}

export function WeatherCard(props: WeatherCardProps) {
  if (props.isForecast) {
    return (
      <ForecastCard
        date={props.date ?? ''}
        maxTemp={props.maxTemp ?? 0}
        minTemp={props.minTemp ?? 0}
        condition={props.condition ?? ''}
        precipitation={props.precipitation ?? 0}
        uvIndex={props.uvIndex}
      />
    );
  }
  return (
    <CurrentWeatherCard
      temperature={props.temperature ?? 0}
      feelsLike={props.feelsLike}
      condition={props.condition ?? ''}
      humidity={props.humidity ?? 0}
      windSpeed={props.windSpeed ?? 0}
      uvIndex={props.uvIndex ?? 0}
      visibilityKm={props.visibilityKm}
    />
  );
}