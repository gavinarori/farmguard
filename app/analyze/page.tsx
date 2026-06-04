'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Loader2, ArrowLeft, RotateCcw, Upload,
  TreePine, Layers, Leaf, Sparkles, History,
} from 'lucide-react';

import { useStore, normalizeAnalysis } from '@/lib/store';
import { analyzeTree, getQuotaUsage } from '@/lib/api-client';
import { ImageUploader } from '@/components/image-uploader';
import { AnalysisResults } from '@/components/analysis-results';

export default function AnalyzePage() {
  const { addAnalysis, quotaUsed, quotaLimit, quotaRemaining, setQuota } = useStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [meta, setMeta] = useState<{ county?: string; landAcres?: number; location?: string; notes?: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReturnType<typeof normalizeAnalysis> | null>(null);

  useEffect(() => {
    getQuotaUsage()
      .then((d) => setQuota(d.used ?? 0, d.limit ?? 5, d.remaining ?? 5))
      .catch(() => {});
  }, [setQuota]);

  const handleAnalyze = async () => {
    if (!selectedFile) { setError('Please select an image first.'); return; }
    if (quotaUsed >= quotaLimit) {
      setError('Monthly quota reached. Upgrade your plan or wait for reset.');
      return;
    }
    setLoading(true); setError(null);
    try {
      const raw = await analyzeTree(selectedFile, { ...meta, location: meta.location ?? 'Farm' });
      const blobUrl = URL.createObjectURL(selectedFile);
      const analysis = normalizeAnalysis(raw, blobUrl);
      setResult(analysis);
      addAnalysis(analysis);
      getQuotaUsage()
        .then((d) => setQuota(d.used ?? 0, d.limit ?? 5, d.remaining ?? 5))
        .catch(() => {});
    } catch (e: any) {
      setError(e.message ?? 'Analysis failed. Please try again.');
    } finally { setLoading(false); }
  };

  const resetForm = () => { setResult(null); setSelectedFile(null); setError(null); setMeta({}); };

  const quotaPct = quotaLimit > 0 ? Math.min(100, (quotaUsed / quotaLimit) * 100) : 0;
  const quotaBarColor = quotaPct >= 90 ? '#c05c5c' : quotaPct >= 70 ? '#d4934a' : '#5cad6e';

  return (
    <div className="app-bg" style={{ minHeight: '100vh' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Top Nav ─────────────────────────────────────────── */}
        <nav className="nav-bar">
          <div
            style={{
              maxWidth: '820px',
              margin: '0 auto',
              padding: '0 1.5rem',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <button className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}>
                <ArrowLeft style={{ width: '0.85rem', height: '0.85rem' }} />
                Dashboard
              </button>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  background: 'linear-gradient(135deg, #5cad6e, #3d7a4e)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TreePine style={{ width: '14px', height: '14px', color: '#0b0f0d' }} />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--col-text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                Farm<span style={{ color: 'var(--col-green)' }}>Guard</span>
              </span>
            </div>

            <Link href="/history">
              <button className="btn btn-ghost" style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}>
                <History style={{ width: '0.85rem', height: '0.85rem' }} />
                History
              </button>
            </Link>
          </div>
        </nav>

        {/* ── Main ────────────────────────────────────────────── */}
        <div
          style={{
            maxWidth: '680px',
            margin: '0 auto',
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Page header */}
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                fontWeight: 900,
                color: 'var(--col-text-primary)',
                lineHeight: 1.1,
                marginBottom: '0.3rem',
              }}
            >
              Analyze Trees
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--col-text-muted)' }}>
              Upload a farm image — AI counts trees & assesses health
            </p>
          </div>

          {/* Quota bar */}
          <div
            className="card-surface"
            style={{ padding: '1rem 1.25rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <p className="section-label">Monthly Analyses</p>
              <div className="num" style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--col-text-primary)' }}>{quotaUsed}</span>
                <span style={{ color: 'var(--col-text-muted)' }}>/ {quotaLimit}</span>
                {quotaRemaining > 0 && (
                  <span style={{ color: 'var(--col-green)', fontSize: '0.72rem', marginLeft: '0.4rem' }}>
                    {quotaRemaining} remaining
                  </span>
                )}
              </div>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${quotaPct}%`, background: quotaBarColor }}
              />
            </div>
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

          {/* ── Results view ─────────────────────────────────── */}
          {result && (
            <>
              <div className="card-surface" style={{ padding: '1.25rem' }}>
                {/* Success header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    marginBottom: '1rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid var(--col-border)',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'var(--col-green-glow)',
                      border: '1px solid rgba(92,173,110,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Sparkles style={{ width: '0.9rem', height: '0.9rem', color: 'var(--col-green)' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--col-text-primary)', fontSize: '0.95rem' }}>
                      Analysis Complete
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--col-text-muted)' }}>
                      AI-powered tree health assessment
                    </p>
                  </div>
                </div>

                <AnalysisResults analysis={result} />
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  onClick={resetForm}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.7rem', fontSize: '0.875rem' }}
                >
                  <RotateCcw style={{ width: '0.9rem', height: '0.9rem' }} />
                  Analyze Another
                </button>
                <Link href="/history" style={{ flex: 1 }}>
                  <button className="btn btn-ghost" style={{ width: '100%', padding: '0.7rem', fontSize: '0.875rem' }}>
                    View History
                  </button>
                </Link>
              </div>
            </>
          )}

          {/* ── Upload form ───────────────────────────────────── */}
          {!result && (
            <>
              <div className="card-surface" style={{ padding: '1.25rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    paddingBottom: '0.85rem',
                    borderBottom: '1px solid var(--col-border)',
                  }}
                >
                  <Upload style={{ width: '0.9rem', height: '0.9rem', color: 'var(--col-green)' }} />
                  <h2 style={{ fontWeight: 600, color: 'var(--col-text-primary)', fontSize: '0.9rem' }}>
                    Upload Farm Image
                  </h2>
                </div>
                <ImageUploader
                  onImageSelected={(f) => { setSelectedFile(f); setError(null); setResult(null); }}
                  isLoading={loading}
                  showMetaFields
                  onMetaChange={setMeta}
                />
              </div>

              {/* Analyze + History buttons */}
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || loading || quotaUsed >= quotaLimit}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.8rem', fontSize: '0.925rem', height: '52px' }}
                >
                  {loading ? (
                    <>
                      <Loader2 style={{ width: '1rem', height: '1rem' }} className="animate-spin" />
                      Analyzing…
                    </>
                  ) : (
                    <>
                      <Sparkles style={{ width: '1rem', height: '1rem' }} />
                      Analyze Trees
                    </>
                  )}
                </button>
                <Link href="/history">
                  <button className="btn btn-ghost" style={{ padding: '0.8rem 1.1rem', height: '52px' }}>
                    <History style={{ width: '0.95rem', height: '0.95rem' }} />
                  </button>
                </Link>
              </div>

              {/* Tips */}
              <div className="card-surface" style={{ padding: '1rem 1.25rem' }}>
                <p className="section-label" style={{ marginBottom: '0.75rem' }}>Tips for best results</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
                  {[
                    { emoji: '🚁', tip: 'Use drone or aerial images for counting' },
                    { emoji: '☀️', tip: 'Good lighting improves accuracy' },
                    { emoji: '🌿', tip: 'Canopy shots improve species detection' },
                    { emoji: '📁', tip: 'JPEG · PNG · WEBP · up to 20 MB' },
                  ].map(({ emoji, tip }) => (
                    <div
                      key={tip}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                        background: 'var(--col-surface-2)',
                        borderRadius: 'var(--r-md)',
                        padding: '0.65rem 0.75rem',
                      }}
                    >
                      <span style={{ fontSize: '1rem', flexShrink: 0 }}>{emoji}</span>
                      <p style={{ fontSize: '0.75rem', color: 'var(--col-text-muted)', lineHeight: 1.45 }}>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}