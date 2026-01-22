'use client';

import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center">
      <div className="container mx-auto px-4 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Simple Logo */}
          <div className="mb-8">
            <h1 className="text-7xl md:text-8xl font-bold gradient-text mb-4">
              TrueTrace
            </h1>
            <p className="text-sm text-gray-400">by IronLogix</p>
          </div>

          {/* Main Question - HUGE and CLEAR */}
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Is Your Photo Real or Edited?
          </h2>

          {/* Simple Explanation */}
          <p className="text-2xl md:text-3xl text-gray-300 mb-6">
            Upload any photo and we'll detect if it's been manipulated
          </p>
          
          <p className="text-lg text-gray-400 mb-12">
            Free • Fast • No signup required
          </p>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gray-400 flex flex-col items-center gap-2"
          >
            <span>Upload your photo below</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
