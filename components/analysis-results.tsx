'use client';

import { TreeAnalysis } from '@/lib/store';
import { Card } from '@/components/ui/card';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface AnalysisResultsProps {
  analysis: TreeAnalysis;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'bg-green-50 border-green-200';
      case 'diseased':
        return 'bg-red-50 border-red-200';
      case 'stressed':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'diseased':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'stressed':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getHealthLabel = (health: string) => {
    return health.charAt(0).toUpperCase() + health.slice(1);
  };

  return (
    <div className="space-y-4">
      {/* Image with overlay */}
      <div className="relative rounded-lg overflow-hidden">
        <img
          src={analysis.imageUrl}
          alt="Tree analysis"
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <div className="flex items-center gap-3 bg-white/95 backdrop-blur px-6 py-3 rounded-lg">
            {getHealthIcon(analysis.health)}
            <div>
              <p className="text-sm text-gray-600">Health Status</p>
              <p className="text-lg font-bold text-gray-900">
                {getHealthLabel(analysis.health)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Details Card */}
      <Card className={`p-4 border-2 ${getHealthColor(analysis.health)}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Analysis Details</h3>
          <span className="text-sm font-medium text-gray-600">
            Confidence: {(analysis.confidence * 100).toFixed(0)}%
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Analyzed at {new Date(analysis.timestamp).toLocaleString()}
        </div>
      </Card>

      {/* Observations */}
      {analysis.observations.length > 0 && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Observations
          </h4>
          <ul className="space-y-2">
            {analysis.observations.map((obs, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>{obs}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <Card className="p-4 border-green-200 bg-green-50">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-green-600" />
            Recommendations
          </h4>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
