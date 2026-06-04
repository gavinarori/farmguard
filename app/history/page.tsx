'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { getAnalysisHistory } from '@/lib/api-client';
import { AnalysisResults } from '@/components/analysis-results';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const ITEMS_PER_PAGE = 6;

export default function HistoryPage() {
  const { analyses } = useStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [historyData, setHistoryData] = useState<any[]>(analyses || []);

  useEffect(() => {
    // Load history from API
    const loadHistory = async () => {
      setLoading(true);
      try {
        const data = await getAnalysisHistory(currentPage, ITEMS_PER_PAGE);
        setHistoryData(data.analyses || []);
      } catch (err: any) {
        console.error('[v0] History error:', err);
        // Fall back to local store
        setHistoryData(analyses);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [currentPage, analyses]);

  const displayedData = selectedAnalysis ? [selectedAnalysis] : historyData;
  const totalPages = Math.ceil(
    (historyData.length || analyses.length) / ITEMS_PER_PAGE
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Analysis History
            </h1>
            <p className="text-gray-600 mt-1">
              Review your tree health analyses
            </p>
          </div>
          <Link href="/analyze">
            <Button className="bg-green-600 hover:bg-green-700">
              New Analysis
            </Button>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        )}

        {/* Detailed View */}
        {selectedAnalysis && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Button
                onClick={() => setSelectedAnalysis(null)}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to List
              </Button>
            </div>
            <AnalysisResults analysis={selectedAnalysis} />
          </>
        )}

        {/* List View */}
        {!selectedAnalysis && (
          <>
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                <span className="ml-2 text-gray-600">Loading history...</span>
              </div>
            )}

            {/* History Grid */}
            {!loading && historyData.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {historyData
                    .slice(
                      (currentPage - 1) * ITEMS_PER_PAGE,
                      currentPage * ITEMS_PER_PAGE
                    )
                    .map((item) => (
                      <Card
                        key={item.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedAnalysis(item)}
                      >
                        <div className="relative">
                          <img
                            src={item.imageUrl}
                            alt="Tree analysis"
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              className="opacity-0 hover:opacity-100 transition-opacity bg-white"
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                item.health === 'healthy'
                                  ? 'bg-green-100 text-green-700'
                                  : item.health === 'diseased'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {item.health.charAt(0).toUpperCase() +
                                item.health.slice(1)}
                            </span>
                            <span className="text-xs text-gray-600">
                              {(item.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                          {item.observations.length > 0 && (
                            <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                              {item.observations[0]}
                            </p>
                          )}
                        </div>
                      </Card>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <Button
                          key={idx + 1}
                          onClick={() => setCurrentPage(idx + 1)}
                          variant={
                            currentPage === idx + 1 ? 'default' : 'outline'
                          }
                          size="sm"
                          className={
                            currentPage === idx + 1
                              ? 'bg-green-600'
                              : ''
                          }
                        >
                          {idx + 1}
                        </Button>
                      ))}
                    </div>
                    <Button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!loading && historyData.length === 0 && analyses.length === 0 && (
              <Card className="p-12 text-center bg-white">
                <p className="text-gray-600 mb-4">No analysis history yet</p>
                <Link href="/analyze">
                  <Button className="bg-green-600 hover:bg-green-700">
                    Start Analyzing Trees
                  </Button>
                </Link>
              </Card>
            )}
          </>
        )}

        {/* Navigation */}
        <div className="flex gap-2">
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full">
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/analyze" className="flex-1">
            <Button className="w-full bg-green-600 hover:bg-green-700">
              New Analysis
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
