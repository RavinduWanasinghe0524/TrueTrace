'use client';

import { useState } from 'react';
import Hero from '@/components/Hero';
import FileUpload from '@/components/FileUpload';
import AnalysisResults from '@/components/AnalysisResults';
import DebugVisualization from '@/components/DebugVisualization';
import { AnalysisResult } from '@/lib/types';

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result: AnalysisResult = await response.json();
      setAnalysisResult(result);

      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Upload Section */}
      {!analysisResult && (
        <FileUpload onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
      )}

      {/* Error Display */}
      {error && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto glass border-2 border-red-500/30 rounded-2xl p-6 bg-red-500/10">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠</span>
              <div>
                <h3 className="text-red-400 font-bold mb-1">Analysis Error</h3>
                <p className="text-gray-300">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {analysisResult && (
        <div id="results" className="space-y-0">
          <AnalysisResults result={analysisResult} />
          <DebugVisualization
            elaImage={analysisResult.debugImages.ela}
            noiseMap={analysisResult.debugImages.noiseMap}
          />

          {/* Reset Button */}
          <div className="container mx-auto px-4 pb-12">
            <div className="max-w-md mx-auto">
              <button
                onClick={handleReset}
                className="w-full px-8 py-4 glass rounded-xl hover:glass-strong transition-all duration-300 font-bold group"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Analyze Another Image
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-white/10">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold">
              IL
            </div>
            <span className="text-xl font-bold gradient-text">IronLogix</span>
          </div>
          <p className="text-gray-400 text-sm mb-2">
            Advanced Document Forgery Detection Technology
          </p>
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} IronLogix. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
