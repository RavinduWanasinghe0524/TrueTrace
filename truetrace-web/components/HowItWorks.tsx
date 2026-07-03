'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const steps = [
  {
    num: '01',
    title: 'Upload Your Photo',
    description: 'Choose any JPEG, PNG, or PDF from your device. We support photos and documents up to 10MB. No account required.',
    color: '#06b6d4',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" />
        <path d="M17 8l-5-5-5 5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 3v12" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'AI Runs 4 Checks',
    description: 'Our forensic engine analyzes ELA patterns, EXIF metadata, digital noise variance, and AI-based anomaly detection.',
    color: '#8b5cf6',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
        <path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Get Your Verdict',
    description: 'Receive a confidence score and detailed findings. See exactly which checks passed or failed with expandable details.',
    color: '#10b981',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      </svg>
    ),
  },
];

const checks = [
  {
    title: 'ELA Analysis',
    description: 'Detects re-compressed regions by comparing JPEG artifacts. Edited areas glow brighter on the error-level map.',
    color: '#06b6d4',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 12h3l3-6 4 10 3-6 2 2h3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Metadata Inspection',
    description: 'Scans EXIF data for editing software signatures, missing timestamps, GPS inconsistencies, and device mismatches.',
    color: '#8b5cf6',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Noise Pattern Analysis',
    description: 'Real cameras produce uniform noise. Spliced images show abrupt discontinuities at manipulation boundaries.',
    color: '#10b981',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M2 12h2M6 12h.01M10 6v12M14 8v8M18 10v4M22 12h-2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'AI Forensics',
    description: 'Deep-learning model detects copy-move cloning, frequency domain anomalies, and region splicing invisible to humans.',
    color: '#f59e0b',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" strokeLinecap="round" />
        <path d="M7 8h10M7 11h7" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="how-it-works" ref={ref} className="relative z-10 py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">Process</p>
          <h2
            className="text-4xl md:text-5xl font-bold gradient-text mb-4"
            style={{ fontFamily: 'var(--font-heading), sans-serif' }}
          >
            How It Works
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Three steps to know the truth about any photo or document
          </p>
        </motion.div>

        {/* Steps — connected timeline */}
        <div className="relative mb-20">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 left-1/2 -translate-x-1/2 w-2/3 h-px">
            <div className="h-full gradient-divider opacity-60" />
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="group card p-8 text-center card-hover"
              >
                {/* Step number + icon */}
                <div className="relative inline-block mb-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto transition-all duration-300 group-hover:scale-110"
                    style={{ background: `${step.color}18`, color: step.color, boxShadow: `0 0 0 1px ${step.color}30` }}
                  >
                    {step.icon}
                  </div>
                  <span
                    className="absolute -top-2 -right-2 text-xs font-black rounded-full w-6 h-6 flex items-center justify-center text-white"
                    style={{ background: step.color, fontFamily: 'var(--font-heading), sans-serif' }}
                  >
                    {i + 1}
                  </span>
                </div>

                <p
                  className="text-2xl font-bold text-white mb-3"
                  style={{ fontFamily: 'var(--font-heading), sans-serif' }}
                >
                  {step.title}
                </p>
                <p className="text-slate-400 leading-relaxed text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* What we check grid */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3
            className="text-2xl font-bold text-center text-white mb-8"
            style={{ fontFamily: 'var(--font-heading), sans-serif' }}
          >
            What We Check For
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {checks.map((check, i) => (
              <motion.div
                key={check.title}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                className="group card p-6 hover:border-opacity-30 transition-all duration-300 hover:-translate-y-1"
                style={{ borderColor: `${check.color}0` }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${check.color}30`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; }}
              >
                <div
                  className="inline-flex p-2.5 rounded-xl mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${check.color}15`, color: check.color }}
                >
                  {check.icon}
                </div>
                <h4
                  className="text-sm font-bold text-white mb-2"
                  style={{ fontFamily: 'var(--font-heading), sans-serif' }}
                >
                  {check.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">{check.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
