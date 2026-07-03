'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const privacyFeatures = [
  {
    title: 'No Photo Storage',
    description: 'Your photos are analyzed in real-time and permanently deleted immediately after. We never save, store, or retain your images on any server.',
    color: '#06b6d4',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Zero Account Required',
    description: 'No sign-up, no email, no personal data collected. Just upload your file and get instant results — complete anonymity.',
    color: '#8b5cf6',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" />
        <circle cx="12" cy="7" r="4" />
        <path d="M17 2l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 7H7" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Session-Only Processing',
    description: 'All analysis happens within your browser session. The moment you close the page, every trace of your upload disappears.',
    color: '#10b981',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'HTTPS Encrypted',
    description: 'All data in transit is protected by TLS 1.3 encryption. Your files travel securely from your device to our analysis engine.',
    color: '#f59e0b',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" />
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Privacy() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="privacy" ref={ref} className="relative z-10 py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest mb-3">Privacy</p>
          <h2
            className="text-4xl md:text-5xl font-bold gradient-text mb-4"
            style={{ fontFamily: 'var(--font-heading), sans-serif' }}
          >
            Your Privacy Matters
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            We built TrueTrace with privacy at its core. Here&apos;s exactly how we handle your data.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 gap-5 mb-10">
          {privacyFeatures.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="card p-7 group hover:-translate-y-1 transition-all duration-300"
            >
              {/* Icon + accent line */}
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 p-3 rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${feat.color}15`, color: feat.color }}
                >
                  {feat.icon}
                </div>
                <div>
                  <h3
                    className="text-base font-bold text-white mb-2"
                    style={{ fontFamily: 'var(--font-heading), sans-serif' }}
                  >
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
              </div>
              {/* Bottom accent */}
              <div
                className="mt-5 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, ${feat.color}40, transparent)` }}
              />
            </motion.div>
          ))}
        </div>

        {/* CTA panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="glass-cyan rounded-2xl p-8 text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-emerald-400/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" className="w-7 h-7">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <h3
            className="text-xl font-bold text-white mb-2"
            style={{ fontFamily: 'var(--font-heading), sans-serif' }}
          >
            Questions About Privacy?
          </h3>
          <p className="text-slate-400 text-sm mb-5 max-w-md mx-auto">
            We&apos;re committed to transparency. If you have any privacy concerns or questions about how we handle your data, our team is happy to help.
          </p>
          <a
            href="mailto:support@ironlogix.com"
            className="btn-primary inline-flex text-sm py-3 px-7"
            style={{ fontFamily: 'var(--font-heading), sans-serif' }}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  );
}
