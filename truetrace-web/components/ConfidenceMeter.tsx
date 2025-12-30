'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

interface ConfidenceMeterProps {
  score: number;
  size?: number;
}

export default function ConfidenceMeter({ score, size = 240 }: ConfidenceMeterProps) {
  const animatedScore = useSpring(0, { stiffness: 50, damping: 20 });
  const displayScore = useTransform(animatedScore, (value) => Math.round(value * 10) / 10);

  useEffect(() => {
    animatedScore.set(score);
  }, [score, animatedScore]);

  const getRiskLevel = (value: number) => {
    if (value < 30) return { label: 'Low Risk', color: 'from-green-400 to-emerald-500', glow: 'shadow-green-500/50' };
    if (value < 70) return { label: 'Medium Risk', color: 'from-yellow-400 to-orange-500', glow: 'shadow-yellow-500/50' };
    return { label: 'High Risk', color: 'from-red-400 to-pink-500', glow: 'shadow-red-500/50' };
  };

  const risk = getRiskLevel(score);
  const circumference = 2 * Math.PI * 88;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        className="relative"
        style={{ width: size, height: size }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
      >
        {/* Pulsing Glow */}
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${risk.color} blur-2xl ${risk.glow}`}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* SVG Circle */}
        <svg
          className="relative w-full h-full transform -rotate-90"
          viewBox="0 0 200 200"
        >
          {/* Background Circle */}
          <circle
            cx="100"
            cy="100"
            r="88"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="14"
            fill="none"
          />

          {/* Progress Circle */}
          <motion.circle
            cx="100"
            cy="100"
            r="88"
            stroke="url(#gradient)"
            strokeWidth="14"
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
          />

          {/* Gradient Definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={score < 30 ? '#4ade80' : score < 70 ? '#facc15' : '#f87171'} />
              <stop offset="100%" stopColor={score < 30 ? '#10b981' : score < 70 ? '#f97316' : '#ec4899'} />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-6xl font-bold bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent"
            style={{ fontSize: size / 4 }}
          >
            {displayScore.get().toFixed(1)}%
          </motion.span>
          <span className="text-sm text-gray-400 mt-2" style={{ fontSize: size / 20 }}>
            Fake Probability
          </span>
        </div>

        {/* Rotating Border Accent */}
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${risk.color} opacity-20`}
          style={{
            clipPath: 'polygon(50% 0%, 100% 0%, 100% 5%, 50% 5%)',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </motion.div>

      {/* Risk Label */}
      <motion.div
        className={`mt-6 px-8 py-3 rounded-full bg-gradient-to-r ${risk.color} text-white font-bold text-lg shadow-lg ${risk.glow}`}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {risk.label}
      </motion.div>

      {/* Description */}
      <motion.p
        className="text-center text-gray-300 max-w-md mt-4 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {score < 30
          ? 'The image appears to be authentic with minimal signs of manipulation.'
          : score < 70
          ? 'Some signs of potential manipulation detected. Further investigation recommended.'
          : 'High likelihood of manipulation detected. This image shows significant signs of forgery.'}
      </motion.p>
    </div>
  );
}
