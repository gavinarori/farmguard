'use client';

import { Cloud, CloudRain, Sun, Wind, Droplets, Eye } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Card } from '@/components/ui/card';

interface WeatherCardProps {
  isForecast?: boolean;
  date?: string;
  maxTemp?: number;
  minTemp?: number;
  condition?: string;
  precipitation?: number;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  uvIndex?: number;
  visibilityKm?: number;
}

export function WeatherCard({
  isForecast = false,
  date,
  maxTemp,
  minTemp,
  condition,
  precipitation,
  temperature,
  humidity,
  windSpeed,
  uvIndex,
  visibilityKm,
}: WeatherCardProps) {
  const { isCelsius } = useStore();

  const getWeatherIcon = (cond: string) => {
    const lower = cond.toLowerCase();
    if (lower.includes('rain') || lower.includes('rainy')) {
      return <CloudRain className="w-8 h-8 text-blue-500" />;
    }
    if (lower.includes('cloud') || lower.includes('cloudy')) {
      return <Cloud className="w-8 h-8 text-gray-400" />;
    }
    return <Sun className="w-8 h-8 text-yellow-500" />;
  };

  if (isForecast) {
    return (
      <Card className="p-4 text-center bg-gradient-to-br from-blue-50 to-green-50 border-green-200">
        <p className="text-sm font-medium text-gray-700">{date}</p>
        <div className="my-2 flex justify-center">
          {getWeatherIcon(condition || 'sunny')}
        </div>
        <p className="text-xs text-gray-600 mb-2">{condition}</p>
        <p className="text-lg font-bold text-gray-900">
          {maxTemp}° / {minTemp}°
        </p>
        <p className="text-xs text-blue-600 mt-1">
          💧 {precipitation?.toFixed(1) || 0}mm
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-500 to-green-500 text-white border-0">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold">{temperature}°</h3>
          <p className="text-blue-100">{condition}</p>
        </div>
        <div className="text-4xl opacity-80">{getWeatherIcon(condition || 'sunny')}</div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
        <div className="bg-white/20 rounded-lg p-3 backdrop-blur">
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="w-4 h-4" />
            <span className="text-blue-100">Humidity</span>
          </div>
          <p className="font-semibold text-lg">{humidity}%</p>
        </div>
        <div className="bg-white/20 rounded-lg p-3 backdrop-blur">
          <div className="flex items-center gap-2 mb-1">
            <Wind className="w-4 h-4" />
            <span className="text-blue-100">Wind</span>
          </div>
          <p className="font-semibold text-lg">{windSpeed} km/h</p>
        </div>
        <div className="bg-white/20 rounded-lg p-3 backdrop-blur">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-4 h-4" />
            <span className="text-blue-100">UV Index</span>
          </div>
          <p className="font-semibold text-lg">{uvIndex}</p>
        </div>
        <div className="bg-white/20 rounded-lg p-3 backdrop-blur">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-4 h-4" />
            <span className="text-blue-100">Visibility</span>
          </div>
          <p className="font-semibold text-lg">{visibilityKm || 10}km</p>
        </div>
      </div>
    </Card>
  );
}
