'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisResult } from '@/lib/types';
import { useState, useEffect, useRef } from 'react';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

/* ── Animated Confidence Ring ─────────────────────────────────────── */
function ConfidenceRing({ score, color, label }: { score: number; color: string; label?: string }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 400);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div className="relative w-44 h-44 mx-auto">
      {/* Glow behind ring */}
      <div
        className="absolute inset-4 rounded-full"
        style={{ background: `radial-gradient(circle, ${color}20, transparent 70%)` }}
      />
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        {/* Track */}
        <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        {/* Animated ring */}
        <motion.circle
          cx="64" cy="64" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (animated / 100) * circumference }}
          transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1], delay: 0.5 }}
          style={{ filter: `drop-shadow(0 0 10px ${color}80)` }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-black tabular-nums"
          style={{ color, fontFamily: 'var(--font-heading), sans-serif' }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
        >
          {score}%
        </motion.span>
        <span className="text-[11px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">
          {label || 'Authentic'}
        </span>
      </div>
    </div>
  );
}

/* ── Detector SVG icons ───────────────────────────────────────────── */
const detectorIcons: Record<string, React.ReactNode> = {
  'ELA': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 12h3l3-6 4 10 3-6 2 2h3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  'Metadata': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h5" strokeLinecap="round" />
    </svg>
  ),
  'Noise Variance': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M2 12h2M6 12h.01M10 6v12M14 8v8M18 10v4M22 12h-2" strokeLinecap="round" />
    </svg>
  ),
  'AI Forensics': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
      <path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" strokeLinecap="round" />
    </svg>
  ),
};

/* ── Detector Card ────────────────────────────────────────────────── */
function DetectorCard({
  detector, index,
}: {
  detector: AnalysisResult['results'][0];
  index: number;
}) {
  const [open, setOpen] = useState(false);

  const palette = {
    Pass:    { bar: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-500/8', border: 'border-emerald-500/20', label: 'Clean', dot: '#10b981' },
    Warning: { bar: '#f59e0b', text: 'text-amber-400',   bg: 'bg-amber-500/8',   border: 'border-amber-500/20',   label: 'Suspicious', dot: '#f59e0b' },
    Fail:    { bar: '#ef4444', text: 'text-rose-400',    bg: 'bg-rose-500/8',    border: 'border-rose-500/20',    label: 'Flagged', dot: '#ef4444' },
  };

  const c = palette[detector.result] || palette.Warning;

  const descriptions: Record<string, string> = {
    'ELA': 'Error Level Analysis checks how pixels respond to JPEG re-compression at multiple quality levels. Edited regions typically show higher error values, appearing as bright spots in the ELA map.',
    'Metadata': 'EXIF metadata inspection looks for suspicious editing software traces, missing timestamps, dimension mismatches, and inconsistent GPS or device data that may indicate post-processing.',
    'Noise Variance': 'Digital camera sensors produce unique, consistent PRNU noise. Spliced objects, digital text, or composited regions show abrupt noise discontinuities.',
    'AI Forensics': 'Deep multi-technique inspection: detects generative AI signatures (diffusion spectral rolloff, GAN lattice grids, uniform synthetic noise) and document tampering (pasted fonts, whiteout blocks).',
  };

  return (
    <motion.div
      className={`rounded-xl border ${c.border} overflow-hidden`}
      style={{ background: 'rgba(255,255,255,0.02)' }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 + 0.8 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-all cursor-pointer"
        aria-expanded={open}
      >
        <div className={`flex-shrink-0 p-2 rounded-lg ${c.bg} ${c.text}`}>
          {detectorIcons[detector.detector] ?? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 mb-1.5">
            <p className="text-sm font-semibold text-white">{detector.detector}</p>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${c.text} border ${c.border}`} style={{ background: `${c.dot}10` }}>
              {c.label}
            </span>
          </div>
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: c.bar, boxShadow: `0 0 6px ${c.bar}60` }}
                initial={{ width: 0 }}
                animate={{ width: `${detector.score}%` }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
            <span className={`text-xs font-bold min-w-[2.5rem] ${c.text} tabular-nums`}>{detector.score}%</span>
          </div>
        </div>

        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 text-slate-500"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
              <p className="text-xs text-slate-400 leading-relaxed italic">{descriptions[detector.detector]}</p>
              <pre className="text-xs text-slate-300 rounded-lg p-3 whitespace-pre-wrap font-mono leading-relaxed" style={{ background: 'rgba(0,0,0,0.4)' }}>
                {detector.details}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Main Results Component ───────────────────────────────────────── */
export default function AnalysisResults({ result }: AnalysisResultsProps) {
  const [showDetails, setShowDetails] = useState(false);
  const particlesFiredRef = useRef(false);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (!particlesFiredRef.current) {
      particlesFiredRef.current = true;
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 2500);
    }
  }, []);

  const getVerdict = () => {
    // 1. Explicit AI Generation
    const isAi =
      result.isAiGenerated ||
      result.verdict === 'AI Generated' ||
      result.category === 'ai_generated' ||
      result.results.some((r) => r.detector === 'AI Forensics' && r.score >= 58 && r.result === 'Fail');

    if (isAi) {
      return {
        title: 'AI GENERATED CONTENT',
        message:
          result.summary ||
          'Strong generative AI signatures detected (diffusion frequency rolloff, uniform synthetic noise, or smoothed micro-textures).',
        color: '#a855f7',
        textColor: 'text-purple-400',
        borderColor: 'border-purple-500/35',
        bgColor: 'rgba(168,85,247,0.08)',
        badge: 'AI GENERATED',
        badgeBg: '#9333ea',
        icon: 'ai',
        ringLabel: 'Authenticity',
      };
    }

    // 2. Document Tampering
    const isDocTampered =
      result.verdict === 'Tampered Document' ||
      result.category === 'document_tampered' ||
      result.results.some((r) => r.detector === 'AI Forensics' && r.details.includes('Document tampering'));

    if (isDocTampered) {
      return {
        title: 'DOCUMENT TAMPERING DETECTED',
        message:
          result.summary ||
          'Localized document alterations detected (altered text, pasted digital font, or whited-out patches).',
        color: '#f43f5e',
        textColor: 'text-rose-400',
        borderColor: 'border-rose-500/35',
        bgColor: 'rgba(244,63,94,0.08)',
        badge: 'TAMPERED DOC',
        badgeBg: '#e11d48',
        icon: 'doc',
        ringLabel: 'Integrity',
      };
    }

    // 3. Clear Signs of Manipulation
    if (result.verdict === 'Clear Signs of Manipulation' || result.finalScore < 40) {
      return {
        title: 'CLEAR SIGNS OF MANIPULATION',
        message:
          result.summary ||
          'Multiple forensic indicators detect digital splicing, copy-move duplication, or compression inconsistencies.',
        color: '#ef4444',
        textColor: 'text-red-400',
        borderColor: 'border-red-500/35',
        bgColor: 'rgba(239,68,68,0.08)',
        badge: 'MANIPULATED',
        badgeBg: '#dc2626',
        icon: 'x',
        ringLabel: 'Authentic',
      };
    }

    // 4. Possibly Modified
    if (result.verdict === 'Possibly Edited' || result.finalScore < 70) {
      return {
        title: 'POSSIBLY MODIFIED',
        message:
          result.summary ||
          'Some suspicious signals detected — re-compression or minor adjustments present.',
        color: '#f59e0b',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-500/35',
        bgColor: 'rgba(245,158,11,0.08)',
        badge: 'UNCERTAIN',
        badgeBg: '#d97706',
        icon: 'warning',
        ringLabel: 'Authentic',
      };
    }

    // 5. Likely Authentic
    return {
      title: 'APPEARS AUTHENTIC',
      message:
        result.summary ||
        'No significant signs of manipulation or synthetic generation detected across all forensic checks.',
      color: '#10b981',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgColor: 'rgba(16,185,129,0.08)',
      badge: 'AUTHENTIC',
      badgeBg: '#059669',
      icon: 'check',
      ringLabel: 'Authentic',
    };
  };

  const v = getVerdict();
  const failCount = result.results.filter((r) => r.result === 'Fail').length;
  const passCount = result.results.filter((r) => r.result === 'Pass').length;
  const warnCount = result.results.filter((r) => r.result === 'Warning').length;

  const VerdictIcon = () => {
    if (v.icon === 'ai') {
      return (
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 blur-lg bg-purple-500/30 rounded-full" />
          <svg viewBox="0 0 24 24" fill="none" stroke={v.color} strokeWidth="2" className="w-10 h-10 relative z-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        </div>
      );
    }
    if (v.icon === 'doc') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={v.color} strokeWidth="2.2" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
        </svg>
      );
    }
    if (v.icon === 'check') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={v.color} strokeWidth="2.5" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    if (v.icon === 'warning') {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={v.color} strokeWidth="2.5" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke={v.color} strokeWidth="2.5" className="w-10 h-10">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  return (
    <div className="relative z-10 py-12 px-4">
      {/* Confetti particles on authentic pass */}
      {showParticles && v.icon === 'check' && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 60 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{ left: '50%', top: '30%', background: `hsl(${(i * 6) % 360}, 80%, 60%)` }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                x: Math.cos((i / 60) * Math.PI * 2) * (200 + Math.random() * 300),
                y: Math.sin((i / 60) * Math.PI * 2) * (200 + Math.random() * 300),
                scale: [0, 1.5, 0],
                opacity: [1, 0.7, 0],
              }}
              transition={{ duration: 2, ease: 'easeOut', delay: Math.random() * 0.4 }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 80 }}
        className="max-w-2xl mx-auto space-y-4"
      >
        {/* ── VERDICT CARD ── */}
        <motion.div
          className="rounded-3xl p-8 border relative overflow-hidden glass-holo"
          style={{
            borderColor: `${v.color}35`,
            background: v.bgColor,
          }}
          whileHover={{ scale: 1.005 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {/* Ambient pulse glow */}
          <motion.div
            className="absolute inset-0 opacity-15 pointer-events-none rounded-3xl"
            animate={{
              background: [
                `radial-gradient(circle at 25% 50%, ${v.color}60, transparent 60%)`,
                `radial-gradient(circle at 75% 50%, ${v.color}60, transparent 60%)`,
                `radial-gradient(circle at 25% 50%, ${v.color}60, transparent 60%)`,
              ],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          />

          {/* Scan lines */}
          <div className="absolute inset-0 scan-lines rounded-3xl opacity-20 pointer-events-none" />

          {/* Header */}
          <div className="flex items-start justify-between mb-6 relative z-10">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                Forensic Analysis Complete
              </p>
              <h2
                className={`text-2xl md:text-3xl font-black ${v.textColor}`}
                style={{ fontFamily: 'var(--font-heading), sans-serif' }}
              >
                {v.title}
              </h2>
              <p className="text-sm text-slate-300 mt-1.5 max-w-sm leading-relaxed">{v.message}</p>
            </div>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="flex-shrink-0 ml-4"
            >
              <VerdictIcon />
            </motion.div>
          </div>

          {/* Ring + stats */}
          <div className="flex items-center justify-around relative z-10 mb-6 flex-wrap gap-4">
            <ConfidenceRing score={result.finalScore} color={v.color} label={v.ringLabel} />

            <div className="space-y-4">
              {[
                { count: passCount, label: 'Checks passed', color: '#10b981' },
                { count: warnCount, label: 'Warnings', color: '#f59e0b' },
                { count: failCount, label: 'Failed checks', color: '#ef4444' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                  <div>
                    <p className="text-2xl font-black tabular-nums" style={{ color: s.color, fontFamily: 'var(--font-heading), sans-serif' }}>{s.count}</p>
                    <p className="text-[11px] text-slate-400">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badge */}
          <motion.div
            className="text-center relative z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: 'spring' }}
          >
            <span
              className="inline-flex items-center gap-2 text-xs font-black px-6 py-2.5 rounded-full text-white tracking-widest uppercase"
              style={{ background: v.badgeBg, boxShadow: `0 0 20px ${v.badgeBg}60` }}
            >
              {v.badge}
            </span>
          </motion.div>
        </motion.div>

        {/* ── DETAILS TOGGLE ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-6 py-4 glass rounded-xl hover:bg-white/5 transition-all text-sm font-semibold text-slate-300 flex items-center justify-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-cyan-400">
              <circle cx="10" cy="10" r="7" />
              <path d="M10 6v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {showDetails ? 'Hide Forensic Breakdown' : 'View Forensic Breakdown — All 4 Checks'}
            <motion.div animate={{ rotate: showDetails ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-3 space-y-2"
              >
                <p className="text-xs text-slate-400 text-center px-4 mb-3">
                  Click any check to expand detailed findings. Scores indicate manipulation / synthetic probability.
                </p>

                {result.results.map((det, i) => (
                  <DetectorCard key={det.detector} detector={det} index={i} />
                ))}

                {/* Debug images */}
                {result.debugImages && (
                  <motion.div
                    className="glass rounded-xl p-5 mt-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-cyan-400">
                        <rect x="2" y="3" width="16" height="14" rx="2" />
                        <circle cx="7.5" cy="8.5" r="1.5" />
                        <path d="M18 14l-5-5L5 18" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Forensic Visualizations
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { src: result.debugImages.ela, label: 'ELA Map', sub: 'Bright spots = compression anomalies' },
                        { src: result.debugImages.noiseMap, label: 'Noise Map', sub: 'Color disparities = spliced regions' },
                      ].map((img) => (
                        <div key={img.label}>
                          <p className="text-[11px] text-slate-400 mb-1.5 font-medium">{img.label}</p>
                          <p className="text-[10px] text-slate-500 mb-2">{img.sub}</p>
                          <img
                            src={img.src}
                            alt={img.label}
                            className="w-full rounded-lg border border-white/8"
                          />
                        </div>
                      ))}
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
