'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(latest > prev && latest > 80);
    setAtTop(latest < 10);
  });

  const scrollToUpload = () => {
    document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      animate={{ y: hidden ? -80 : 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        atTop ? 'bg-transparent border-b border-transparent' : 'glass-nav'
      }`}
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="relative w-8 h-8 flex-shrink-0">
              <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
                <circle cx="16" cy="16" r="14" stroke="url(#logo-grad)" strokeWidth="2" />
                <circle cx="16" cy="16" r="8" stroke="url(#logo-grad)" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx="16" cy="16" r="3" fill="url(#logo-grad)" />
                <line x1="16" y1="2" x2="16" y2="8" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
                <defs>
                  <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#06b6d4" />
                    <stop offset="1" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <span
                className="text-xl font-bold gradient-text"
                style={{ fontFamily: 'var(--font-heading, "Space Grotesk"), sans-serif' }}
              >
                TrueTrace
              </span>
              <span className="text-xs text-slate-500 ml-2 hidden sm:inline">by IronLogix</span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: 'How It Works', href: '#how-it-works' },
              { label: 'Examples', href: '#examples' },
              { label: 'Privacy', href: '#privacy' },
              { label: 'FAQ', href: '#faq' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={scrollToUpload}
            className="btn-primary text-sm py-2.5 px-5"
            style={{ fontFamily: 'var(--font-heading), sans-serif' }}
            aria-label="Try TrueTrace free — scroll to upload"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 3v10M10 3l-3 3M10 3l3 3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 14v1a2 2 0 002 2h10a2 2 0 002-2v-1" strokeLinecap="round" />
            </svg>
            Try Free
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
