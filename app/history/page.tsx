'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { getAnalysisHistory } from '@/lib/api-client';
import { AnalysisResults } from '@/components/analysis-results';
import Link from 'next/link';
import {
  Loader2, ChevronLeft, ChevronRight,
  TreePine, Clock, ArrowLeft, Sparkles, History,
} from 'lucide-react';

const ITEMS_PER_PAGE = 6;

const HEALTH_DOT: Record<string, string> = {
  healthy:  '#5cad6e',
  diseased: '#c05c5c',
  stressed: '#d4934a',
};

export default function HistoryPage() {
  const { analyses } = useStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [historyData, setHistoryData] = useState<any[]>(analyses || []);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true); setError(null);
      try {
        const data = await getAnalysisHistory(ITEMS_PER_PAGE);
        const normalizedData = (data.analyses || []).map((item: any) => ({
          id: item.analysis_id,
          analysis_id: item.analysis_id,
          timestamp: item.timestamp,
          imageUrl: item.original_image_url,
          overlayImageUrl: item.overlay_image_url,
          treeCount: item.total_tree_count ?? 0,
          confidence: typeof item.confidence_score === 'number' ? item.confidence_score : 0,
          health: item.health_status || 'unknown',
          location: item.location,
          county: item.county,
          landAcres: item.land_acres,
          treeDensityPerAcre: item.tree_density_per_acre,
          canopyCoveragePct: item.canopy_coverage_pct,
          observations: item.observations || [],
          ...item,
        }));
        setHistoryData(normalizedData);
      } catch (err: any) {
        setError('Failed to load history. Showing locally stored analyses.');
        setHistoryData(
          (analyses || []).map((item: any, index: number) => ({
            ...item,
            id: item.id || item.analysis_id || `local-analysis-${index}-${Date.now()}`,
          }))
        );
      } finally { setLoading(false); }
    };
    loadHistory();
  }, [analyses]);

  const totalPages = Math.ceil(historyData.length / ITEMS_PER_PAGE);
  const pagedData = historyData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="app-bg" style={{ minHeight: '100vh' }}>
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Nav ───────────────────────────────────────────────── */}
        <nav className="nav-bar">
          <div
            style={{
              maxWidth: '1000px',
              margin: '0 auto',
              padding: '0 1.5rem',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
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

            <Link href="/analyze">
              <button className="btn btn-primary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem' }}>
                <Sparkles style={{ width: '0.82rem', height: '0.82rem' }} />
                New Analysis
              </button>
            </Link>
          </div>
        </nav>

        {/* ── Main ─────────────────────────────────────────────── */}
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Page header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
                  fontWeight: 900,
                  color: 'var(--col-text-primary)',
                  lineHeight: 1.1,
                  marginBottom: '0.25rem',
                }}
              >
                Analysis History
              </h1>
              <p style={{ fontSize: '0.83rem', color: 'var(--col-text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock style={{ width: '0.78rem', height: '0.78rem' }} />
                Review your past tree health analyses
              </p>
            </div>
            {historyData.length > 0 && (
              <span className="tag tag-muted num">
                {historyData.length} {historyData.length === 1 ? 'analysis' : 'analyses'}
              </span>
            )}
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: 'rgba(212,147,74,0.1)',
                border: '1px solid rgba(212,147,74,0.25)',
                borderRadius: 'var(--r-md)',
                fontSize: '0.83rem',
                color: 'var(--col-amber)',
              }}
            >
              {error}
            </div>
          )}

          {/* Detailed view */}
          {selectedAnalysis && (
            <>
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="btn btn-ghost"
                style={{ alignSelf: 'flex-start', fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
              >
                <ChevronLeft style={{ width: '0.85rem', height: '0.85rem' }} />
                Back to list
              </button>
              <div className="card-surface animate-fade-up" style={{ padding: '1.25rem' }}>
                <AnalysisResults analysis={selectedAnalysis} />
              </div>
            </>
          )}

          {/* List view */}
          {!selectedAnalysis && (
            <>
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '5rem 0', color: 'var(--col-text-muted)' }}>
                  <Loader2 style={{ width: '1.4rem', height: '1.4rem', color: 'var(--col-green)' }} className="animate-spin" />
                  <span style={{ fontSize: '0.85rem' }}>Loading history…</span>
                </div>
              )}

              {!loading && historyData.length > 0 && (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                      gap: '0.9rem',
                    }}
                  >
                    {pagedData.map((item, i) => {
                      const healthColor = HEALTH_DOT[item.health] ?? '#8fa891';
                      const healthLabel = item.health
                        ? item.health.charAt(0).toUpperCase() + item.health.slice(1)
                        : 'Unknown';
                      return (
                        <div
                          key={item.id || item.analysis_id}
                          className="card-interactive animate-fade-up"
                          style={{
                            overflow: 'hidden',
                            animationDelay: `${i * 40}ms`,
                          }}
                          onClick={() => setSelectedAnalysis(item)}
                        >
                          {/* Image */}
                          <div style={{ position: 'relative' }}>
                            <img
                              src={item.imageUrl || '/placeholder-tree.jpg'}
                              alt="Tree analysis"
                              style={{ width: '100%', height: '10.5rem', objectFit: 'cover', display: 'block' }}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)',
                                display: 'flex',
                                alignItems: 'flex-end',
                                padding: '0.65rem',
                              }}
                            >
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  padding: '0.22rem 0.6rem',
                                  borderRadius: '99px',
                                  background: 'rgba(0,0,0,0.5)',
                                  backdropFilter: 'blur(8px)',
                                  border: `1px solid ${healthColor}55`,
                                  fontSize: '0.68rem',
                                  fontWeight: 600,
                                  color: healthColor,
                                  fontFamily: 'var(--font-mono)',
                                  letterSpacing: '0.05em',
                                  textTransform: 'uppercase',
                                }}
                              >
                                <span
                                  style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: healthColor,
                                    flexShrink: 0,
                                  }}
                                />
                                {healthLabel}
                              </span>
                            </div>
                          </div>

                          {/* Info */}
                          <div style={{ padding: '0.875rem 1rem' }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '0.45rem',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <TreePine style={{ width: '0.85rem', height: '0.85rem', color: 'var(--col-green)' }} />
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--col-text-primary)' }}>
                                  {typeof item.treeCount === 'number'
                                    ? `${item.treeCount} trees`
                                    : 'Tree Analysis'}
                                </span>
                              </div>
                              <span
                                className="num"
                                style={{
                                  fontSize: '0.7rem',
                                  color: 'var(--col-text-muted)',
                                  background: 'var(--col-surface-3)',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '99px',
                                }}
                              >
                                {Number(item.confidence || 0).toFixed(0)}% conf
                              </span>
                            </div>

                            <p
                              className="num"
                              style={{ fontSize: '0.72rem', color: 'var(--col-text-muted)', marginBottom: '0.45rem' }}
                            >
                              {item.timestamp
                                ? new Date(item.timestamp).toLocaleString()
                                : 'Unknown date'}
                            </p>

                            {item.observations?.length > 0 && (
                              <p
                                style={{
                                  fontSize: '0.78rem',
                                  color: 'var(--col-text-secondary)',
                                  lineHeight: 1.45,
                                  overflow: 'hidden',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {item.observations[0]}
                              </p>
                            )}

                            <div style={{ marginTop: '0.65rem', display: 'flex', justifyContent: 'flex-end' }}>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  color: 'var(--col-green)',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                }}
                              >
                                View Details
                                <ChevronRight style={{ width: '0.72rem', height: '0.72rem' }} />
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        paddingTop: '0.5rem',
                      }}
                    >
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="btn btn-ghost"
                        style={{ padding: '0.4rem 0.55rem', borderRadius: 'var(--r-md)' }}
                      >
                        <ChevronLeft style={{ width: '0.9rem', height: '0.9rem' }} />
                      </button>

                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(idx + 1)}
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: 'var(--r-md)',
                            border: '1px solid',
                            borderColor: currentPage === idx + 1 ? 'var(--col-green)' : 'var(--col-border)',
                            background: currentPage === idx + 1 ? 'var(--col-green)' : 'var(--col-surface)',
                            color: currentPage === idx + 1 ? '#0b0f0d' : 'var(--col-text-muted)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          {idx + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="btn btn-ghost"
                        style={{ padding: '0.4rem 0.55rem', borderRadius: 'var(--r-md)' }}
                      >
                        <ChevronRight style={{ width: '0.9rem', height: '0.9rem' }} />
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Empty state */}
              {!loading && historyData.length === 0 && analyses.length === 0 && (
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
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: 'var(--r-lg)',
                      background: 'var(--col-surface-2)',
                      border: '1px solid var(--col-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '0.35rem',
                    }}
                  >
                    <History style={{ width: '1.5rem', height: '1.5rem', color: 'var(--col-text-muted)' }} />
                  </div>
                  <p style={{ fontWeight: 600, color: 'var(--col-text-secondary)', fontSize: '0.95rem' }}>
                    No analysis history yet
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--col-text-muted)', maxWidth: '280px' }}>
                    Upload a farm image and run your first AI tree analysis.
                  </p>
                  <Link href="/analyze">
                    <button className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '0.6rem 1.4rem' }}>
                      <Sparkles style={{ width: '0.9rem', height: '0.9rem' }} />
                      Start Analyzing Trees
                    </button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}