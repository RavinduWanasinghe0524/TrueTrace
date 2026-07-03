'use client';

import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useState, useRef } from 'react';

const categories = [
  {
    label: 'Usage',
    color: '#06b6d4',
    faqs: [
      {
        q: 'Is TrueTrace free to use?',
        a: 'Yes — TrueTrace is completely free. Upload and analyze as many photos or documents as you need. No hidden costs, no subscriptions.',
      },
      {
        q: 'What file types can I upload?',
        a: 'We accept JPEG and PNG images, and PDF documents up to 10MB. These are the most common formats we can analyze forensically.',
      },
      {
        q: 'How long does analysis take?',
        a: 'Most photos are fully analyzed in 3–10 seconds depending on file size and complexity. You\'ll see real-time progress during analysis.',
      },
    ],
  },
  {
    label: 'Results',
    color: '#8b5cf6',
    faqs: [
      {
        q: 'How accurate is TrueTrace?',
        a: 'Our system combines 4 independent forensic methods for high reliability. We always show a confidence score so you can judge the certainty — no system is 100% perfect.',
      },
      {
        q: 'What does the confidence score mean?',
        a: '68–100% means the photo appears authentic. 40–67% means we found some suspicious signals but results are inconclusive. 0–39% means clear signs of manipulation were detected.',
      },
      {
        q: 'Can it detect all types of edits?',
        a: 'We detect most common edits: copy-paste cloning, Photoshop/GIMP filters, retouching, and compositing. Very subtle professional edits may score in the uncertain range.',
      },
    ],
  },
  {
    label: 'Privacy',
    color: '#10b981',
    faqs: [
      {
        q: 'What happens to my uploaded photos?',
        a: 'Your photos are analyzed in real-time and never stored. The moment your session ends, all image data is permanently deleted from our systems.',
      },
      {
        q: 'Do I need to create an account?',
        a: 'No account, no email, no personal information required. Just upload your file and get results — complete anonymity guaranteed.',
      },
    ],
  },
  {
    label: 'Technical',
    color: '#f59e0b',
    faqs: [
      {
        q: 'Does it work on screenshots or social media photos?',
        a: 'Yes, but screenshots often lose original EXIF metadata. We can still analyze compression patterns and noise — the results may be in the uncertain range.',
      },
      {
        q: 'Can I use TrueTrace for legal purposes?',
        a: 'TrueTrace is an excellent investigative tool, but it\'s not a certified legal forensic report. For official proceedings, consult a certified digital forensics expert.',
      },
      {
        q: 'What if I get an error?',
        a: 'Try converting your image to JPEG or PNG format, ensure the file is under 10MB, or try again in a few moments. Contact support if the issue persists.',
      },
    ],
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="border-b border-white/6 last:border-0"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 py-4 text-left hover:bg-white/3 rounded-lg px-3 -mx-3 transition-all duration-200 cursor-pointer"
        aria-expanded={open}
      >
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-slate-400"
        >
          <svg viewBox="0 0 12 12" fill="currentColor" className="w-2.5 h-2.5">
            <path d="M6 0v12M0 6h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        </motion.div>
        <span className="text-sm font-semibold text-white leading-relaxed flex-1">{q}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="text-sm text-slate-400 leading-relaxed pb-4 pl-8 pr-3">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const currentFaqs = categories[activeCategory].faqs;

  return (
    <section id="faq" ref={ref} className="relative z-10 py-24 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">FAQ</p>
          <h2
            className="text-4xl md:text-5xl font-bold gradient-text mb-4"
            style={{ fontFamily: 'var(--font-heading), sans-serif' }}
          >
            Common Questions
          </h2>
          <p className="text-slate-400 text-lg">Everything you need to know about TrueTrace</p>
        </motion.div>

        {/* Category tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap gap-2 justify-center mb-8"
        >
          {categories.map((cat, i) => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(i)}
              className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-all duration-250 cursor-pointer ${
                activeCategory === i
                  ? 'text-white'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
              style={{ fontFamily: 'var(--font-heading), sans-serif' }}
              aria-pressed={activeCategory === i}
            >
              {activeCategory === i && (
                <motion.span
                  layoutId="faq-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: `${cat.color}20`, boxShadow: `0 0 0 1px ${cat.color}40` }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10" style={activeCategory === i ? { color: cat.color } : {}}>
                {cat.label}
              </span>
            </button>
          ))}
        </motion.div>

        {/* FAQ panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="card rounded-2xl p-6"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentFaqs.map((faq, i) => (
                <FAQItem key={faq.q} q={faq.q} a={faq.a} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Still have questions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-slate-500">
            Still have questions?{' '}
            <a
              href="mailto:support@ironlogix.com"
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Contact our team →
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
