'use client';

import { useState } from 'react';
import Hero from '@/components/Hero';
import FileUpload from '@/components/FileUpload';
import AnalysisResults from '@/components/AnalysisResults';
import DebugVisualization from '@/components/DebugVisualization';
import ParticleBackground from '@/components/ParticleBackground';
import LoadingScreen from '@/components/LoadingScreen';
import { AnalysisResult } from '@/lib/types';

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');

  const handleAnalyze = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setProgress(0);

    // Store uploaded file for comparison
    const reader = new FileReader();
    reader.onload = (e) => setUploadedFile(e.target?.result as string);
    reader.readAsDataURL(file);

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

      setStage('Analyzing metadata');
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      setStage('Processing results');
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
    setUploadedFile(null);
    setProgress(0);
    setStage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Particle Background */}
      <ParticleBackground />

      {/* Loading Screen */}
      {isAnalyzing && <LoadingScreen progress={progress} stage={stage} />}

      <main className="min-h-screen relative z-10">
        {/* Hero Section */}
        <Hero />

        {/* Upload Section */}
        {!analysisResult && !isAnalyzing && (
          <FileUpload onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
        )}

        {/* Error Display */}
        {error && !isAnalyzing && (
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto glass border-2 border-red-500/30 rounded-2xl p-6 bg-red-500/10">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠</span>
                <div>
                  <h3 className="text-red-400 font-bold mb-1">Analysis Error</h3>
                  <p className="text-gray-300">{error}</p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="mt-4 w-full px-6 py-3 glass rounded-xl hover:glass-strong transition-all duration-300 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {analysisResult && !isAnalyzing && (
          <div id="results" className="space-y-0">
            <AnalysisResults result={analysisResult} />
            <DebugVisualization
              elaImage={analysisResult.debugImages.ela}
              noiseMap={analysisResult.debugImages.noiseMap}
              originalImage={uploadedFile || undefined}
            />

            {/* Reset Button */}
            <div className="container mx-auto px-4 pb-12">
              <div className="max-w-md mx-auto">
                <button
                  onClick={handleReset}
                  className="w-full px-8 py-4 glass rounded-xl hover:glass-strong transition-all duration-300 font-bold group magnetic-btn glow-sm"
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
        <footer className="container mx-auto px-4 py-12 border-t border-white/10 relative z-10">
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
    </>
  );
}
