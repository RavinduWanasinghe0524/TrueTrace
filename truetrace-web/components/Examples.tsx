'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

/* ── Mini Confidence Ring ── */
function MiniRing({ score, color }: { score: number; color: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative w-20 h-20 mx-auto mb-4">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <motion.circle
          cx="36" cy="36" r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (score / 100) * circ }}
          transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-lg font-black tabular-nums"
          style={{ color, fontFamily: 'var(--font-heading), sans-serif' }}
        >
          {score}%
        </span>
      </div>
    </div>
  );
}

const examples = [
  {
    verdict: 'Authentic',
    badge: 'REAL',
    score: 87,
    message: 'No manipulation detected',
    color: '#10b981',
    borderColor: 'border-emerald-500/20',
    bg: 'rgba(16,185,129,0.06)',
    checks: [
      { label: 'Metadata intact', pass: true },
      { label: 'Consistent compression', pass: true },
      { label: 'Natural noise patterns', pass: true },
      { label: 'AI forensics: clean', pass: true },
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    verdict: 'Uncertain',
    badge: 'SUSPICIOUS',
    score: 54,
    message: 'Some signals detected',
    color: '#f59e0b',
    borderColor: 'border-amber-500/20',
    bg: 'rgba(245,158,11,0.06)',
    checks: [
      { label: 'Missing metadata fields', pass: false },
      { label: 'Compression looks OK', pass: true },
      { label: 'Minor noise variations', pass: false },
      { label: 'AI: low-confidence anomalies', pass: true },
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
  },
  {
    verdict: 'Manipulated',
    badge: 'EDITED',
    score: 22,
    message: 'Clear signs of editing',
    color: '#ef4444',
    borderColor: 'border-red-500/20',
    bg: 'rgba(239,68,68,0.06)',
    checks: [
      { label: 'Software trace in EXIF', pass: false },
      { label: 'Compression mismatch (ELA)', pass: false },
      { label: 'Inconsistent noise map', pass: false },
      { label: 'AI: high-confidence edit', pass: false },
    ],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function Examples() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="examples" ref={ref} className="relative z-10 py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest mb-3">Sample Results</p>
          <h2
            className="text-4xl md:text-5xl font-bold gradient-text mb-4"
            style={{ fontFamily: 'var(--font-heading), sans-serif' }}
          >
            What Results Look Like
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Here&apos;s what you&apos;ll see when you upload a photo for analysis
          </p>
        </motion.div>

        {/* Example cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {examples.map((ex, i) => (
            <motion.div
              key={ex.verdict}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className={`rounded-2xl border ${ex.borderColor} p-6 relative overflow-hidden`}
              style={{ background: ex.bg }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              {/* Glow */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none opacity-10"
                style={{ background: `radial-gradient(circle at 50% 0%, ${ex.color}, transparent 60%)` }}
              />

              {/* Header */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                  {ex.icon}
                  <span
                    className="font-bold text-sm"
                    style={{ color: ex.color, fontFamily: 'var(--font-heading), sans-serif' }}
                  >
                    {ex.verdict}
                  </span>
                </div>
                <span
                  className="text-xs font-black px-3 py-1 rounded-full text-white"
                  style={{ background: ex.color }}
                >
                  {ex.badge}
                </span>
              </div>

              {/* Score ring */}
              <div className="relative z-10">
                <MiniRing score={ex.score} color={ex.color} />
              </div>

              {/* Message */}
              <p className="text-sm text-slate-400 text-center mb-4 relative z-10">&quot;{ex.message}&quot;</p>

              {/* Check list */}
              <div className="space-y-2 relative z-10">
                {ex.checks.map((check) => (
                  <div key={check.label} className="flex items-center gap-2.5">
                    {check.pass ? (
                      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 flex-shrink-0">
                        <circle cx="8" cy="8" r="7" fill="rgba(16,185,129,0.2)" />
                        <path d="M5 8l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 flex-shrink-0">
                        <circle cx="8" cy="8" r="7" fill="rgba(239,68,68,0.2)" />
                        <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                    <span className="text-xs text-slate-400">{check.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pro tip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass rounded-2xl p-6 flex items-start gap-4"
        >
          <div className="flex-shrink-0 p-2.5 rounded-xl bg-cyan-400/10 text-cyan-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-1">Pro Tip for Best Accuracy</p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Upload original photos directly from your camera or phone for the most accurate results.
              Screenshots, social media downloads, or heavily re-compressed images may reduce accuracy.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
