'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  progress?: number;
  stage?: string;
}

export default function LoadingScreen({ progress = 0, stage = 'Initializing...' }: LoadingScreenProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1.3s' }} />
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow" style={{ animationDelay: '2.6s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md px-6">
        {/* Logo Animation */}
        <motion.div
          className="mb-12 flex items-center gap-3"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
        >
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-600 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-2xl"
            animate={{
              rotateY: [0, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            IL
          </motion.div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">TrueTrace</h1>
            <p className="text-sm text-gray-400">IronLogix</p>
          </div>
        </motion.div>

        {/* Circular Progress */}
        <div className="relative w-48 h-48 mb-8">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              stroke="url(#loadingGradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray="553"
              initial={{ strokeDashoffset: 553 }}
              animate={{ strokeDashoffset: 553 - (progress / 100) * 553 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="loadingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-5xl font-bold"
              key={progress}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {Math.round(progress)}%
            </motion.span>
          </div>
        </div>

        {/* Stage Text */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-lg text-gray-300 font-medium">
            {stage}{dots}
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="w-full space-y-2">
          {[
            { name: 'AI Forensic Analysis', complete: progress > 20 },
            { name: 'Metadata Analysis', complete: progress > 40 },
            { name: 'Error Level Analysis', complete: progress > 60 },
            { name: 'Noise Variance Detection', complete: progress > 80 },
            { name: 'Finalizing Results', complete: progress >= 100 }
          ].map((step, index) => (
            <motion.div
              key={step.name}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                step.complete
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 border-cyan-500'
                  : 'border-gray-600'
              }`}>
                {step.complete && (
                  <motion.svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </motion.svg>
                )}
              </div>
              <span className={`text-sm ${step.complete ? 'text-white font-medium' : 'text-gray-500'}`}>
                {step.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Scanning Animation */}
        <motion.div
          className="mt-8 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </div>
    </motion.div>
  );
}
