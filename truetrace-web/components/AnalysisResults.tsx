'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisResult } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

// Animated SVG confidence ring
function ConfidenceRing({ score, color }: { score: number; color: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 400);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        {/* Background ring */}
        <circle
          cx="64" cy="64" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
        />
        {/* Animated score ring */}
        <motion.circle
          cx="64" cy="64" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (animated / 100) * circumference }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      {/* Score text in center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-black"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
        >
          {score}%
        </motion.span>
        <span className="text-xs text-gray-400 font-medium mt-1">Authentic</span>
      </div>
    </div>
  );
}

// Per-detector detail card
function DetectorCard({
  detector,
  icon,
  index,
}: {
  detector: AnalysisResult['results'][0];
  icon: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  const statusColors = {
    Pass: { bar: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    Warning: { bar: '#f59e0b', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    Fail: { bar: '#ef4444', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  };

  const colors = statusColors[detector.result];
  const statusLabels = { Pass: 'Clean', Warning: 'Suspicious', Fail: 'Flagged' };

  const descriptions: Record<string, string> = {
    'ELA': 'Checks how pixels respond to re-compression at multiple quality levels. Edited regions respond differently.',
    'Metadata': 'Inspects EXIF data for suspicious editing software, missing dates, or dimension mismatches.',
    'Noise Variance': 'Analyzes noise texture across image regions. Spliced images show abrupt noise jumps at boundaries.',
    'AI Forensics': 'Combines copy-move detection, region splicing analysis, and frequency domain checks.',
  };

  return (
    <motion.div
      className={`rounded-xl border ${colors.border} ${colors.bg} overflow-hidden`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 + 0.8 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-all"
      >
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-white text-sm">{detector.detector}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
              {statusLabels[detector.result]}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: colors.bar }}
                initial={{ width: 0 }}
                animate={{ width: `${detector.score}%` }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <span className={`text-xs font-bold min-w-[2.5rem] ${colors.text}`}>{detector.score}%</span>
          </div>
        </div>
        <motion.span
          className="text-gray-500 text-sm"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >▼</motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
              <p className="text-xs text-gray-500 italic">{descriptions[detector.detector]}</p>
              <pre className="text-xs text-gray-300 bg-black/30 rounded-lg p-3 whitespace-pre-wrap font-mono leading-relaxed">
                {detector.details}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const particlesRef = useRef<boolean>(false);

  useEffect(() => {
    if (!particlesRef.current) {
      particlesRef.current = true;
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 2500);
    }
  }, []);

  const getVerdict = () => {
    if (result.finalScore >= 68) {
      return {
        emoji: '✅',
        title: 'APPEARS AUTHENTIC',
        message: 'No significant signs of manipulation detected',
        color: '#10b981',
        textColor: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
        ringColor: '#10b981',
        badge: 'REAL',
        badgeBg: 'bg-emerald-500',
      };
    } else if (result.finalScore >= 40) {
      return {
        emoji: '⚠️',
        title: 'POSSIBLY MODIFIED',
        message: 'Some suspicious signals found — results are inconclusive',
        color: '#f59e0b',
        textColor: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        ringColor: '#f59e0b',
        badge: 'UNCERTAIN',
        badgeBg: 'bg-amber-500',
      };
    } else {
      return {
        emoji: '❌',
        title: 'LIKELY MANIPULATED',
        message: 'Multiple forensic signals indicate editing or forgery',
        color: '#ef4444',
        textColor: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        ringColor: '#ef4444',
        badge: 'EDITED',
        badgeBg: 'bg-red-500',
      };
    }
  };

  const verdict = getVerdict();

  const detectorIcons: Record<string, string> = {
    'ELA': '🔬',
    'Metadata': '🏷️',
    'Noise Variance': '📡',
    'AI Forensics': '🤖',
  };

  const failCount = result.results.filter(r => r.result === 'Fail').length;
  const passCount = result.results.filter(r => r.result === 'Pass').length;
  const warnCount = result.results.filter(r => r.result === 'Warning').length;

  return (
    <div className="container mx-auto px-4 py-12 relative">
      {/* Particle burst on mount */}
      {showParticles && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                background: `hsl(${(i * 7) % 360}, 80%, 60%)`,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                x: Math.cos((i / 50) * Math.PI * 2) * (150 + Math.random() * 250),
                y: Math.sin((i / 50) * Math.PI * 2) * (150 + Math.random() * 250),
                scale: [0, 1.5, 0],
                opacity: [1, 0.8, 0],
              }}
              transition={{ duration: 2, ease: 'easeOut', delay: Math.random() * 0.3 }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 80 }}
        className="max-w-2xl mx-auto"
      >
        {/* ━━━ MAIN VERDICT CARD ━━━ */}
        <motion.div
          className={`glass-holographic rounded-3xl p-8 border-2 ${verdict.borderColor} ${verdict.bgColor} relative overflow-hidden`}
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {/* Ambient glow */}
          <motion.div
            className="absolute inset-0 opacity-10 pointer-events-none"
            animate={{
              background: [
                `radial-gradient(circle at 30% 50%, ${verdict.color}55 0%, transparent 60%)`,
                `radial-gradient(circle at 70% 50%, ${verdict.color}55 0%, transparent 60%)`,
                `radial-gradient(circle at 30% 50%, ${verdict.color}55 0%, transparent 60%)`,
              ],
            }}
            transition={{ duration: 6, repeat: Infinity }}
          />

          {/* Header row */}
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-1">Analysis Complete</p>
              <h2 className={`text-2xl md:text-3xl font-black ${verdict.textColor}`}>
                {verdict.title}
              </h2>
              <p className="text-gray-400 text-sm mt-1">{verdict.message}</p>
            </div>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="text-5xl"
            >
              {verdict.emoji}
            </motion.div>
          </div>

          {/* Confidence ring + stats */}
          <div className="flex items-center justify-around relative z-10">
            <ConfidenceRing score={result.finalScore} color={verdict.ringColor} />

            {/* Quick Stats */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                <div>
                  <p className="text-2xl font-black text-emerald-400">{passCount}</p>
                  <p className="text-xs text-gray-500">Checks passed</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                <div>
                  <p className="text-2xl font-black text-amber-400">{warnCount}</p>
                  <p className="text-xs text-gray-500">Warnings</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_8px_#ef4444]" />
                <div>
                  <p className="text-2xl font-black text-red-400">{failCount}</p>
                  <p className="text-xs text-gray-500">Failed checks</p>
                </div>
              </div>
            </div>
          </div>

          {/* Verdict badge */}
          <motion.div
            className="mt-6 text-center relative z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: 'spring' }}
          >
            <span className={`inline-block ${verdict.badgeBg} text-white text-sm font-black px-6 py-2 rounded-full tracking-widest shadow-lg`}>
              {verdict.badge}
            </span>
          </motion.div>
        </motion.div>

        {/* ━━━ TRUST BREAKDOWN ━━━ */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-6 py-4 glass-holographic rounded-xl hover:bg-white/10 transition-all text-sm font-semibold text-gray-300"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <span className="flex items-center justify-center gap-2">
              <motion.span animate={{ rotate: showDetails ? 180 : 0 }} transition={{ duration: 0.2 }}>
                ▼
              </motion.span>
              {showDetails ? 'Hide Trust Breakdown' : '🔍 View Trust Breakdown — All 4 Forensic Checks'}
            </span>
          </motion.button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="mt-3 space-y-3"
              >
                <p className="text-xs text-gray-500 text-center px-4">
                  Click any check to see detailed findings. Scores show manipulation probability per method.
                </p>
                {result.results.map((det, i) => (
                  <DetectorCard
                    key={det.detector}
                    detector={det}
                    icon={detectorIcons[det.detector] ?? '🔎'}
                    index={i}
                  />
                ))}

                {/* Debug images */}
                {result.debugImages && (
                  <motion.div
                    className="glass-holographic rounded-xl p-4 mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-medium">📊 Forensic Visualizations</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-400 mb-1 text-center">ELA Map (red = anomalies)</p>
                        <img
                          src={result.debugImages.ela}
                          alt="ELA Analysis"
                          className="w-full rounded-lg border border-white/10"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1 text-center">Noise Map (red = spliced)</p>
                        <img
                          src={result.debugImages.noiseMap}
                          alt="Noise Map"
                          className="w-full rounded-lg border border-white/10"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
