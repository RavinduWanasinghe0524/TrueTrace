'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface Stat {
  value: number;
  suffix: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [inView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function StatsBar() {
  const stats: Stat[] = [
    {
      value: 50000,
      suffix: '+',
      label: 'Photos Analyzed',
      color: '#06b6d4',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      value: 4,
      suffix: '',
      label: 'Forensic Checks',
      color: '#8b5cf6',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          <path d="M11 8v3l2 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      value: 99,
      suffix: '%',
      label: 'Privacy — No Storage',
      color: '#10b981',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" />
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      value: 10,
      suffix: 's',
      label: 'Average Analysis Time',
      color: '#f59e0b',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative z-10 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="gradient-divider mb-12" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
              className="glass rounded-2xl p-6 text-center group hover:border-opacity-40 transition-all duration-300"
              style={{ borderColor: inView ? `${stat.color}30` : undefined }}
            >
              <div
                className="inline-flex p-2.5 rounded-xl mb-3 transition-all duration-300 group-hover:scale-110"
                style={{ background: `${stat.color}18`, color: stat.color }}
              >
                {stat.icon}
              </div>
              <div
                className="text-3xl font-bold mb-1"
                style={{
                  fontFamily: 'var(--font-heading, "Space Grotesk"), sans-serif',
                  color: stat.color,
                }}
              >
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-xs text-slate-500 font-medium leading-tight">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="gradient-divider mt-12" />
      </div>
    </section>
  );
}
