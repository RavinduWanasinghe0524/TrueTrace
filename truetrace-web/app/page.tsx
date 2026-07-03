'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import StatsBar from '@/components/StatsBar';
import FileUpload from '@/components/FileUpload';
import AnalysisResults from '@/components/AnalysisResults';
import LoadingScreen from '@/components/LoadingScreen';
import HowItWorks from '@/components/HowItWorks';
import Examples from '@/components/Examples';
import FAQ from '@/components/FAQ';
import Privacy from '@/components/Privacy';
import { AnalysisResult } from '@/lib/types';

/* ── Aurora Background ── */
function AuroraBackground() {
  return (
    <div className="aurora-bg" aria-hidden="true">
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      <div className="aurora-blob aurora-blob-4" />
    </div>
  );
}

/* ── Error State ── */
function ErrorCard({ error, onReset }: { error: string; onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative z-10 container mx-auto px-4 py-12"
    >
      <div className="max-w-lg mx-auto card rounded-3xl p-10 text-center border border-red-500/20" style={{ background: 'rgba(239,68,68,0.05)' }}>
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="w-8 h-8">
            <circle cx="12" cy="12" r="10" />
            <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" />
          </svg>
        </div>

        <h3
          className="text-2xl font-bold text-red-400 mb-2"
          style={{ fontFamily: 'var(--font-heading), sans-serif' }}
        >
          Analysis Failed
        </h3>
        <p className="text-slate-400 mb-2 text-sm">
          We couldn&apos;t analyze your photo. Please try a different image.
        </p>
        {error && (
          <p className="text-xs text-slate-600 mb-6 font-mono bg-black/30 rounded-lg px-3 py-2">
            Error: {error}
          </p>
        )}

        <motion.button
          onClick={onReset}
          className="btn-primary"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{ fontFamily: 'var(--font-heading), sans-serif' }}
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M4 10a6 6 0 0112 0" strokeLinecap="round" />
            <path d="M14 10l2-2M14 10l2 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Try Again
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="relative z-10 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="gradient-divider mb-8" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mini logo */}
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <circle cx="12" cy="12" r="10" stroke="url(#footer-grad)" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="4" stroke="url(#footer-grad)" strokeWidth="1.5" strokeDasharray="2 2" />
              <circle cx="12" cy="12" r="1.5" fill="url(#footer-grad)" />
              <defs>
                <linearGradient id="footer-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#06b6d4" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div>
              <span
                className="font-bold text-sm gradient-text"
                style={{ fontFamily: 'var(--font-heading), sans-serif' }}
              >
                TrueTrace
              </span>
              <span className="text-slate-600 text-xs ml-1.5">by IronLogix</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 text-center">
            AI-powered photo forensics · Free, private, and fast ·{' '}
            <span className="text-slate-500">© {new Date().getFullYear()} IronLogix</span>
          </p>

          <a
            href="mailto:support@ironlogix.com"
            className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
          >
            support@ironlogix.com
          </a>
        </div>
      </div>
    </footer>
  );
}

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

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) { clearInterval(progressInterval); return prev; }
        return prev + Math.random() * 6;
      });
    }, 220);

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
      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        setAnalysisResult(result);
        setIsAnalyzing(false);
        setTimeout(() => {
          document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }, 600);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
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
      {/* Aurora background (fixed, behind everything) */}
      <AuroraBackground />

      {/* Loading screen overlay */}
      <AnimatePresence>
        {isAnalyzing && <LoadingScreen progress={progress} />}
      </AnimatePresence>

      {/* Sticky navbar */}
      <Navbar />

      {/* Main content */}
      <main className="relative min-h-screen">
        {/* ── Pre-results view ── */}
        {!analysisResult && !isAnalyzing && (
          <>
            {/* Hero */}
            <Hero />

            {/* Stats bar */}
            <StatsBar />

            {/* File upload */}
            <FileUpload onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

            {/* Error state (shows below upload if error) */}
            {error && <ErrorCard error={error} onReset={handleReset} />}

            {/* Info sections */}
            <HowItWorks />
            <Examples />
            <Privacy />
            <FAQ />
          </>
        )}

        {/* ── Results view ── */}
        {analysisResult && !isAnalyzing && (
          <div id="results" className="pt-20">
            <AnalysisResults result={analysisResult} />

            {/* Reset button */}
            <div className="relative z-10 pb-12 px-4">
              <div className="max-w-sm mx-auto">
                <motion.button
                  onClick={handleReset}
                  className="w-full btn-primary py-4 text-base"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ fontFamily: 'var(--font-heading), sans-serif' }}
                >
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M10 3v10M10 3l-3 3M10 3l3 3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 14v1a2 2 0 002 2h10a2 2 0 002-2v-1" strokeLinecap="round" />
                  </svg>
                  Check Another Photo
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <Footer />
      </main>
    </>
  );
}
