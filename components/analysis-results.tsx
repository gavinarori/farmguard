'use client';

import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  TreePine,
  Layers,
  Leaf,
} from 'lucide-react';
import { TreeAnalysis } from '@/lib/store';
import { formatDate, cn } from '@/lib/utils';

interface AnalysisResultsProps {
  analysis: TreeAnalysis;
  showImage?: boolean;
}

const HEALTH_CONFIG = {
  healthy: {
    label: 'Healthy',
    icon: CheckCircle2,
    accentColor: '#5cad6e',
    tagClass: 'tag-green',
    barColor: '#5cad6e',
    glowColor: 'rgba(92,173,110,0.15)',
    borderColor: 'rgba(92,173,110,0.25)',
  },
  diseased: {
    label: 'Diseased',
    icon: AlertCircle,
    accentColor: '#c05c5c',
    tagClass: 'tag-red',
    barColor: '#c05c5c',
    glowColor: 'rgba(192,92,92,0.15)',
    borderColor: 'rgba(192,92,92,0.25)',
  },
  stressed: {
    label: 'Stressed',
    icon: AlertTriangle,
    accentColor: '#d4934a',
    tagClass: 'tag-amber',
    barColor: '#d4934a',
    glowColor: 'rgba(212,147,74,0.15)',
    borderColor: 'rgba(212,147,74,0.25)',
  },
} as const;

function StatTile({
  icon: Icon,
  label,
  value,
  accent = '#5cad6e',
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="stat-tile">
      <Icon style={{ height: '1rem', width: '1rem', color: accent }} />
      <p className="num" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--col-text-primary)', lineHeight: 1 }}>
        {value}
      </p>
      <p className="section-label">{label}</p>
    </div>
  );
}

function HealthBar({
  label,
  count,
  total,
  barColor,
}: {
  label: string;
  count: number;
  total: number;
  barColor: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--col-text-secondary)' }}>{label}</span>
        <span className="num" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--col-text-primary)' }}>
          {count}{' '}
          <span style={{ color: 'var(--col-text-muted)', fontWeight: 400 }}>({pct}%)</span>
        </span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
    </div>
  );
}

export function AnalysisResults({ analysis, showImage = true }: AnalysisResultsProps) {
  const health = analysis.health || (analysis as any).health_status || 'healthy';
  const confidence = analysis.confidence ?? (analysis as any).confidence_score ?? 0;
  const imageUrl = analysis.imageUrl || (analysis as any).original_image_url;
  const overlayUrl = analysis.overlayUrl || (analysis as any).overlay_image_url;
  const treeCount = analysis.treeCount ?? (analysis as any).total_tree_count ?? 0;
  const densityPerAcre = analysis.densityPerAcre ?? (analysis as any).tree_density_per_acre;
  const canopyCoveragePct = analysis.canopyCoveragePct ?? (analysis as any).canopy_coverage_pct;
  const observations = analysis.observations || [];
  const recommendations = analysis.recommendations || [];

  const cfg = HEALTH_CONFIG[health as keyof typeof HEALTH_CONFIG] ?? HEALTH_CONFIG.healthy;
  const Icon = cfg.icon;

  const treeTotal = analysis.treeHealth
    ? analysis.treeHealth.healthy + analysis.treeHealth.needsCare + analysis.treeHealth.needsReplacement
    : treeCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Image */}
      {showImage && imageUrl && (
        <div style={{ borderRadius: 'var(--r-xl)', overflow: 'hidden', position: 'relative', boxShadow: 'var(--shadow-card)' }}>
          <img
            src={overlayUrl ?? imageUrl}
            alt="Farm tree analysis"
            style={{ width: '100%', maxHeight: '18rem', objectFit: 'cover', display: 'block' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 55%)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '1rem',
              gap: '0.6rem',
            }}
          >
            <span className={cn('tag', cfg.tagClass)}>
              <Icon className="h-3 w-3" />
              {cfg.label}
            </span>
            <span className="tag tag-muted num">
              {Math.round(Number(confidence) || 0)}% confidence
            </span>
          </div>
        </div>
      )}

      {/* Header when no image */}
      {!showImage && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem' }}>
          <span className={cn('tag', cfg.tagClass)}>
            <Icon className="h-3 w-3" />
            {cfg.label}
          </span>
          <span className="tag tag-muted num">
            {Math.round(Number(confidence) || 0)}% confidence
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--col-text-muted)' }}>
            {formatDate(analysis.timestamp)}
          </span>
        </div>
      )}

      {/* Stats */}
      {(treeCount !== undefined || densityPerAcre !== undefined || canopyCoveragePct !== undefined) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
          <StatTile icon={TreePine} label="Trees" value={String(treeCount)} accent="#5cad6e" />
          {densityPerAcre !== undefined && densityPerAcre !== null && (
            <StatTile icon={Layers} label="Per Acre" value={Number(densityPerAcre).toFixed(1)} accent="#5b9bd5" />
          )}
          {canopyCoveragePct !== undefined && canopyCoveragePct !== null && (
            <StatTile icon={Leaf} label="Canopy" value={`${Number(canopyCoveragePct).toFixed(0)}%`} accent="#d4934a" />
          )}
        </div>
      )}

      {/* Species */}
      {analysis.speciesGuess && (
        <p style={{ fontSize: '0.78rem', fontStyle: 'italic', color: 'var(--col-text-muted)' }}>
          Species: <span style={{ color: 'var(--col-text-secondary)' }}>{analysis.speciesGuess}</span>
        </p>
      )}

      {/* Health Breakdown */}
      {analysis.treeHealth && treeTotal > 0 && (
        <div
          style={{
            background: 'var(--col-surface-2)',
            border: `1px solid ${cfg.borderColor}`,
            borderRadius: 'var(--r-lg)',
            padding: '1rem',
          }}
        >
          <p className="section-label" style={{ marginBottom: '0.85rem' }}>Health Breakdown</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <HealthBar label="Healthy" count={analysis.treeHealth.healthy} total={treeTotal} barColor="#5cad6e" />
            <HealthBar label="Needs Care" count={analysis.treeHealth.needsCare} total={treeTotal} barColor="#d4934a" />
            <HealthBar label="Needs Replacement" count={analysis.treeHealth.needsReplacement} total={treeTotal} barColor="#c05c5c" />
          </div>
        </div>
      )}

      {/* Observations */}
      {observations.length > 0 && (
        <div
          style={{
            background: 'var(--col-surface-2)',
            border: '1px solid rgba(91,155,213,0.2)',
            borderRadius: 'var(--r-lg)',
            padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <AlertCircle style={{ height: '0.85rem', width: '0.85rem', color: '#5b9bd5' }} />
            <p className="section-label" style={{ color: '#5b9bd5' }}>Observations</p>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', padding: 0, margin: 0, listStyle: 'none' }}>
            {observations.map((obs, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.85rem', color: 'var(--col-text-secondary)' }}>
                <span style={{ marginTop: '0.45rem', width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0, background: '#5b9bd5' }} />
                {obs}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div
          style={{
            background: 'var(--col-surface-2)',
            border: '1px solid rgba(92,173,110,0.2)',
            borderRadius: 'var(--r-lg)',
            padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Lightbulb style={{ height: '0.85rem', width: '0.85rem', color: '#5cad6e' }} />
            <p className="section-label" style={{ color: '#5cad6e' }}>Recommendations</p>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', padding: 0, margin: 0, listStyle: 'none' }}>
            {recommendations.map((rec, i) => (
              <li key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.85rem', color: 'var(--col-text-secondary)' }}>
                <span style={{ marginTop: '0.45rem', width: '5px', height: '5px', borderRadius: '50%', flexShrink: 0, background: '#5cad6e' }} />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      {showImage && (
        <p className="num" style={{ textAlign: 'right', fontSize: '0.72rem', color: 'var(--col-text-muted)' }}>
          Analyzed {formatDate(analysis.timestamp)}
          {((analysis as any).location || (analysis as any).county) &&
            ` · ${(analysis as any).location || (analysis as any).county}`}
        </p>
      )}
    </div>
  );
}