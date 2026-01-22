'use client';

import { useState } from 'react';
import Hero from '@/components/Hero';
import FileUpload from '@/components/FileUpload';
import AnalysisResults from '@/components/AnalysisResults';
import LoadingScreen from '@/components/LoadingScreen';
import HowItWorks from '@/components/HowItWorks';
import Examples from '@/components/Examples';
import FAQ from '@/components/FAQ';
import Privacy from '@/components/Privacy';
import { AnalysisResult } from '@/lib/types';

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleAnalyze = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 5;
      });
    }, 200);

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
      setProgress(100);
      
      setTimeout(() => {
        setAnalysisResult(result);
        setIsAnalyzing(false);

        // Scroll to results
        setTimeout(() => {
          document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError(null);
    setProgress(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Loading Screen */}
      {isAnalyzing && <LoadingScreen progress={progress} />}

      {/* Main Content */}
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Hero Section */}
        {!analysisResult && !isAnalyzing && <Hero />}

        {/* Upload Section */}
        {!analysisResult && !isAnalyzing && (
          <FileUpload onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
        )}

        {/* Information Sections - Only show before results */}
        {!analysisResult && !isAnalyzing && (
          <>
            <HowItWorks />
            <Examples />
            <Privacy />
            <FAQ />
          </>
        )}

        {/* Error Display */}
        {error && !isAnalyzing && (
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto glass border-2 border-red-500/30 rounded-2xl p-8 bg-red-500/10 text-center">
              <div className="text-6xl mb-4">😕</div>
              <h3 className="text-3xl font-bold text-red-400 mb-3">Oops! Something Went Wrong</h3>
              <p className="text-xl text-gray-300 mb-6">
                We couldn't check your photo. Please try again with a different image.
              </p>
              {error && <p className="text-sm text-gray-400 mb-6">Error: {error}</p>}
              <button
                onClick={handleReset}
                className="px-8 py-4 text-xl glass rounded-xl hover:bg-white/10 transition-all font-semibold"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {analysisResult && !isAnalyzing && (
          <div id="results">
            <AnalysisResults result={analysisResult} />

            {/* Simple Reset Button */}
            <div className="container mx-auto px-4 pb-12">
              <div className="max-w-md mx-auto">
                <button
                  onClick={handleReset}
                  className="w-full px-8 py-5 text-xl bg-gradient-to-r from-cyan-600 to-emerald-600 rounded-xl hover:from-cyan-500 hover:to-emerald-500 transition-all font-bold"
                >
                  Check Another Photo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Simple Footer */}
        <footer className="container mx-auto px-4 py-8 text-center text-gray-500 text-sm">
          <p className="mb-2">
            <span className="font-bold gradient-text">TrueTrace</span> by IronLogix
          </p>
          <p>
            Detect photo editing and manipulation • © {new Date().getFullYear()}
          </p>
        </footer>
      </main>
    </>
  );
}
