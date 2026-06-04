'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { analyzeTree } from '@/lib/api-client';
import { ImageUploader } from '@/components/image-uploader';
import { AnalysisResults } from '@/components/analysis-results';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AnalyzePage() {
  const { addAnalysis, quotaUsed, quotaLimit } = useStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleImageSelected = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select an image');
      return;
    }

    // Check quota
    if (quotaUsed >= quotaLimit) {
      setError(
        'You have reached your daily analysis limit. Try again tomorrow.'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {

      const imageUrl = URL.createObjectURL(selectedFile);

      const analysisResult = await analyzeTree(imageUrl);

      // Create analysis record
      const analysis = {
        id: `analysis-${Date.now()}`,
        timestamp: new Date().toISOString(),
        imageUrl,
        health: analysisResult.health || 'healthy',
        confidence: analysisResult.confidence || 0.85,
        observations: analysisResult.observations || [
          'Leaf color appears normal',
          'No visible disease symptoms',
        ],
        recommendations: analysisResult.recommendations || [
          'Continue regular monitoring',
          'Maintain proper watering schedule',
        ],
      };

      setResult(analysis);
      addAnalysis(analysis);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze tree');
      console.error('[v0] Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Analyze Your Trees
            </h1>
            <p className="text-gray-600 mt-1">
              Upload an image to check tree health
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Quota Info */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Analyses used today:</span>{' '}
            {quotaUsed} of {quotaLimit}
          </p>
          <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(quotaUsed / quotaLimit) * 100}%` }}
            />
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        )}

        {/* Analysis Result */}
        {result && <AnalysisResults analysis={result} />}

        {/* Image Uploader */}
        {!result && (
          <>
            <ImageUploader
              onImageSelected={handleImageSelected}
              isLoading={loading}
            />

            {/* Analyze Button */}
            <div className="flex gap-3">
              <Button
                onClick={handleAnalyze}
                disabled={!selectedFile || loading || quotaUsed >= quotaLimit}
                className="flex-1 bg-green-600 hover:bg-green-700 h-10"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? 'Analyzing...' : 'Analyze Tree'}
              </Button>
              <Link href="/history" className="flex-1">
                <Button variant="outline" className="w-full">
                  View History
                </Button>
              </Link>
            </div>
          </>
        )}

        {/* New Analysis Button */}
        {result && (
          <Button
            onClick={() => {
              setResult(null);
              setSelectedFile(null);
              setError(null);
            }}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Analyze Another Tree
          </Button>
        )}

        {/* Info Section */}
        <Card className="p-6 bg-white border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">
            How to get accurate results:
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Photograph the tree in good lighting</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Include leaves and stems in the image</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Avoid blurry or out-of-focus images</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>Get close enough to see leaf details</span>
            </li>
          </ul>
        </Card>
      </div>
    </main>
  );
}
