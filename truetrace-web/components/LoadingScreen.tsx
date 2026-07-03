'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  progress?: number;
  stage?: string;
}

const stages = [
  { name: 'Initializing Forensic Engine', sub: 'Preparing analysis pipeline...', icon: <InitIcon /> },
  { name: 'Scanning Image Metadata', sub: 'Inspecting EXIF data and headers...', icon: <MetaIcon /> },
  { name: 'Error Level Analysis', sub: 'Detecting compression anomalies...', icon: <ELAIcon /> },
  { name: 'Noise Pattern Detection', sub: 'Mapping digital noise variance...', icon: <NoiseIcon /> },
  { name: 'Finalizing Results', sub: 'Computing confidence scores...', icon: <FinalIcon /> },
];

function InitIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
      <circle cx="20" cy="20" r="16" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="20" cy="20" r="8" stroke="#06b6d4" strokeWidth="2" />
      <circle cx="20" cy="20" r="3" fill="#06b6d4" />
    </svg>
  );
}

function MetaIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
      <rect x="8" y="6" width="24" height="28" rx="3" stroke="#8b5cf6" strokeWidth="2" />
      <path d="M13 14h14M13 19h10M13 24h8" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ELAIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
      <rect x="6" y="6" width="28" height="28" rx="3" stroke="#06b6d4" strokeWidth="2" />
      <path d="M6 20h4l4-8 6 14 4-10 4 4h6" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NoiseIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
      <rect x="8" y="8" width="4" height="4" fill="#10b981" opacity="0.4" />
      <rect x="18" y="8" width="4" height="4" fill="#10b981" />
      <rect x="28" y="8" width="4" height="4" fill="#10b981" opacity="0.6" />
      <rect x="8" y="18" width="4" height="4" fill="#10b981" opacity="0.8" />
      <rect x="18" y="18" width="4" height="4" fill="#10b981" opacity="0.3" />
      <rect x="28" y="18" width="4" height="4" fill="#10b981" opacity="0.9" />
      <rect x="8" y="28" width="4" height="4" fill="#10b981" opacity="0.5" />
      <rect x="18" y="28" width="4" height="4" fill="#10b981" opacity="0.7" />
      <rect x="28" y="28" width="4" height="4" fill="#10b981" opacity="0.2" />
    </svg>
  );
}

function FinalIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
      <path d="M20 4l4.5 11H36l-9.5 7 3.5 11L20 26l-10 7 3.5-11L4 15h11.5L20 4z" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Radar sweep ── */
function RadarScanner({ progress }: { progress: number }) {
  return (
    <div className="relative w-64 h-64 mx-auto">
      {/* Rings */}
      {[64, 96, 128].map((r, i) => (
        <div
          key={i}
          className="absolute rounded-full border border-cyan-500/20"
          style={{
            width: r * 2, height: r * 2,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Radar sweep */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(6,182,212,0.4) 40deg, transparent 80deg)',
          }}
        />
      </motion.div>

      {/* Progress ring SVG */}
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        <circle cx="128" cy="128" r="120" fill="none" stroke="rgba(6,182,212,0.08)" strokeWidth="4" />
        <motion.circle
          cx="128" cy="128" r="120"
          fill="none"
          stroke="url(#prog-grad)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="753.98"
          animate={{ strokeDashoffset: 753.98 * (1 - progress / 100) }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="prog-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div className="text-4xl font-bold gradient-text-cyan" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
          {Math.round(progress)}%
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
              animate={{ scale: [1, 1.8, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>

      {/* Orbiting dots */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: '50%', top: '50%',
            marginLeft: -4, marginTop: -4,
            background: ['#06b6d4', '#8b5cf6', '#10b981'][i],
            boxShadow: `0 0 8px ${['#06b6d4', '#8b5cf6', '#10b981'][i]}`,
          }}
          animate={{
            x: Math.cos((i / 3) * Math.PI * 2) * 112,
            y: Math.sin((i / 3) * Math.PI * 2) * 112,
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
        />
      ))}
    </div>
  );
}

/* ── Data stream panel ── */
const DATA_LINES = [
  '> Parsing image binary header...',
  '> Loading EXIF metadata blocks...',
  '> Running JPEG re-compression analysis...',
  '> Computing local noise variance map...',
  '> Applying DCT frequency analysis...',
  '> Cross-referencing artifact signatures...',
  '> Scoring manipulation probability...',
];

function DataStream() {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < DATA_LINES.length) {
        setLines((prev) => [...prev, DATA_LINES[i]]);
        i++;
      }
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass rounded-xl p-4 font-mono text-xs space-y-1.5 max-h-36 overflow-hidden">
      <AnimatePresence>
        {lines.map((line, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="text-cyan-400/70 flex items-start gap-2"
          >
            <span className="text-emerald-500 flex-shrink-0">›</span>
            <span>{line.replace('> ', '')}</span>
          </motion.div>
        ))}
        {/* Blinking cursor */}
        <motion.div
          className="text-cyan-400/70 flex items-center gap-2"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <span className="text-emerald-500">›</span>
          <span className="w-2 h-3 bg-cyan-400 inline-block" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function LoadingScreen({ progress = 0 }: LoadingScreenProps) {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (progress < 20) setCurrentStage(0);
    else if (progress < 40) setCurrentStage(1);
    else if (progress < 60) setCurrentStage(2);
    else if (progress < 80) setCurrentStage(3);
    else setCurrentStage(4);
  }, [progress]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden hex-grid"
      style={{ background: 'rgba(3,7,18,0.97)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Soft aurora behind */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="aurora-blob aurora-blob-1" style={{ opacity: 0.12 }} />
        <div className="aurora-blob aurora-blob-2" style={{ opacity: 0.08 }} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-px rounded-full bg-cyan-400"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ opacity: [0, 0.8, 0], y: [0, -80] }}
            transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </div>

      {/* Corner brackets */}
      {[
        { top: 24, left: 24, borderBottom: 'none', borderRight: 'none' },
        { top: 24, right: 24, borderBottom: 'none', borderLeft: 'none' },
        { bottom: 24, left: 24, borderTop: 'none', borderRight: 'none' },
        { bottom: 24, right: 24, borderTop: 'none', borderLeft: 'none' },
      ].map((s, i) => (
        <motion.div
          key={i}
          className="absolute w-16 h-16 border-2 border-cyan-400/30"
          style={s as React.CSSProperties}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center max-w-sm px-6 w-full">
        {/* Brand name */}
        <motion.p
          className="text-sm font-semibold gradient-text mb-8 tracking-widest uppercase"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          TrueTrace Forensics
        </motion.p>

        {/* Radar scanner */}
        <div className="mb-8">
          <RadarScanner progress={progress} />
        </div>

        {/* Stage info */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="mb-6"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <div style={{ color: '#06b6d4' }}>{stages[currentStage].icon}</div>
            </div>
            <h2
              className="text-xl font-bold text-white mb-1"
              style={{ fontFamily: 'var(--font-heading), sans-serif' }}
            >
              {stages[currentStage].name}
            </h2>
            <p className="text-sm text-slate-500">{stages[currentStage].sub}</p>
          </motion.div>
        </AnimatePresence>

        {/* Stage dots */}
        <div className="flex justify-center gap-2 mb-6">
          {stages.map((_, i) => (
            <motion.div
              key={i}
              className="h-1 rounded-full transition-all duration-500"
              animate={{
                width: i === currentStage ? 24 : 6,
                background: i <= currentStage ? '#06b6d4' : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>

        {/* Data stream */}
        <DataStream />

        <motion.p
          className="text-xs text-slate-600 mt-4"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          This usually takes under 10 seconds
        </motion.p>
      </div>
    </motion.div>
  );
}
