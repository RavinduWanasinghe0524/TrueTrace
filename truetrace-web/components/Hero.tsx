'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

/* ──────────────────────────────────────────
   Floating forensic badge
────────────────────────────────────────── */
function ForensicBadge({
  label,
  sublabel,
  color,
  delay,
  position,
}: {
  label: string;
  sublabel: string;
  color: string;
  delay: number;
  position: { top?: string; bottom?: string; left?: string; right?: string };
}) {
  return (
    <motion.div
      className="absolute hidden lg:block"
      style={position}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut' }}
        className="glass rounded-xl px-4 py-3 flex items-center gap-2.5 border"
        style={{ borderColor: `${color}30` }}
      >
        <div
          className="w-2 h-2 rounded-full animate-pulse-glow"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
        <div>
          <p className="text-xs font-bold text-white" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>{label}</p>
          <p className="text-[10px] text-slate-500">{sublabel}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────
   Typing animation hook
────────────────────────────────────────── */
function useTypingEffect(text: string, speed = 45, startDelay = 300) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i <= text.length) {
          setDisplayed(text.slice(0, i));
          i++;
        } else {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

/* ──────────────────────────────────────────
   Animated particle field
────────────────────────────────────────── */
function ParticleField() {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2,
    duration: 4 + Math.random() * 6,
    delay: Math.random() * 4,
    color: ['#06b6d4', '#8b5cf6', '#10b981', '#ec4899'][Math.floor(Math.random() * 4)],
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{ opacity: [0, 0.8, 0], y: [0, -60, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────
   Orbital rings decoration
────────────────────────────────────────── */
function OrbitalRings() {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
      {[280, 400, 520, 640].map((size, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-white/5"
          style={{ width: size, height: size }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 20 + i * 8, repeat: Infinity, ease: 'linear' }}
        >
          {/* Dot on ring */}
          <div
            className="absolute w-2 h-2 rounded-full -translate-x-1 -translate-y-1"
            style={{
              top: '0',
              left: '50%',
              background: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'][i],
              boxShadow: `0 0 8px ${['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'][i]}`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────
   Hero Component
────────────────────────────────────────── */
export default function Hero() {
  const { displayed: headline, done: headlineDone } = useTypingEffect(
    'Is Your Photo Real or Edited?',
    40,
    400
  );

  const scrollToUpload = () => {
    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const badges = [
    { label: 'ELA Analysis', sublabel: 'Compression check', color: '#06b6d4', delay: 1.2, position: { top: '18%', left: '6%' } },
    { label: 'Metadata Scan', sublabel: 'EXIF inspection', color: '#8b5cf6', delay: 1.4, position: { top: '22%', right: '6%' } },
    { label: 'Noise Pattern', sublabel: 'Texture variance', color: '#10b981', delay: 1.6, position: { bottom: '28%', left: '5%' } },
    { label: 'AI Forensics', sublabel: 'Deep detection', color: '#f59e0b', delay: 1.8, position: { bottom: '28%', right: '5%' } },
  ];

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden px-4 pt-16">
      {/* Orbital decorations */}
      <OrbitalRings />

      {/* Particle field */}
      <ParticleField />

      {/* Floating forensic badges */}
      {badges.map((b) => (
        <ForensicBadge key={b.label} {...b} />
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" style={{ boxShadow: '0 0 8px #10b981' }} />
          <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase">
            AI-Powered Photo Forensics
          </span>
        </motion.div>

        {/* Brand name */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-6"
        >
          <h1
            className="text-7xl md:text-9xl font-bold gradient-text-animated leading-none"
            style={{ fontFamily: 'var(--font-heading, "Space Grotesk"), sans-serif' }}
          >
            TrueTrace
          </h1>
          <p className="text-sm text-slate-600 mt-2 tracking-widest uppercase">
            by <span className="gradient-text-cyan font-semibold">IronLogix</span>
          </p>
        </motion.div>

        {/* Typed headline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8 min-h-[3.5rem] md:min-h-[4.5rem] flex items-center justify-center"
        >
          <h2
            className="text-2xl md:text-4xl font-semibold text-white/90 leading-tight"
            style={{ fontFamily: 'var(--font-heading), sans-serif' }}
          >
            {headline}
            <motion.span
              className="inline-block w-0.5 h-8 md:h-10 bg-cyan-400 ml-1 rounded-full align-middle"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              style={{ display: headlineDone ? 'none' : 'inline-block' }}
            />
          </h2>
        </motion.div>

        {/* Sub description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Upload any photo or document. Our AI runs{' '}
          <span className="text-cyan-400 font-medium">4 forensic checks</span> — ELA analysis,
          metadata inspection, noise pattern detection, and AI forensics — in seconds.
        </motion.p>

        {/* Trust pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-12"
        >
          {[
            { label: 'Free forever', color: '#10b981' },
            { label: 'No account needed', color: '#06b6d4' },
            { label: 'Privacy-first', color: '#8b5cf6' },
            { label: 'Results in ~10s', color: '#f59e0b' },
          ].map((pill) => (
            <div
              key={pill.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-slate-300"
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: pill.color, boxShadow: `0 0 6px ${pill.color}` }}
              />
              {pill.label}
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center"
        >
          <motion.button
            onClick={scrollToUpload}
            className="btn-primary text-base py-4 px-8 glow-cyan"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{ fontFamily: 'var(--font-heading), sans-serif' }}
            aria-label="Upload photo — start analysis"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 3v10M10 3l-3 3M10 3l3 3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 14v1a2 2 0 002 2h10a2 2 0 002-2v-1" strokeLinecap="round" />
            </svg>
            Upload Your Photo
          </motion.button>

          <a
            href="#how-it-works"
            className="btn-ghost text-sm py-4 px-8"
            style={{ fontFamily: 'var(--font-heading), sans-serif' }}
          >
            See How It Works
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8 }}
          className="mt-16 flex flex-col items-center gap-2 text-slate-600"
        >
          <span className="text-xs tracking-widest uppercase">Scroll to upload</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 4v12M10 16l-4-4M10 16l4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
