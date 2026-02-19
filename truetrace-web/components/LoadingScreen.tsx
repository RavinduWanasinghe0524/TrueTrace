'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  progress?: number;
  stage?: string;
}

export default function LoadingScreen({ progress = 0 }: LoadingScreenProps) {
  const [currentStage, setCurrentStage] = useState(0);
  
  const stages = [
    { name: 'Initializing Analysis', icon: '🔍' },
    { name: 'Scanning Metadata', icon: '📊' },
    { name: 'Error Level Analysis', icon: '🔬' },
    { name: 'Noise Detection', icon: '📡' },
    { name: 'Finalizing Results', icon: '✨' },
  ];

  useEffect(() => {
    if (progress < 20) setCurrentStage(0);
    else if (progress < 40) setCurrentStage(1);
    else if (progress < 60) setCurrentStage(2);
    else if (progress < 80) setCurrentStage(3);
    else setCurrentStage(4);
  }, [progress]);

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 flex items-center justify-center z-50 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Scan Lines Effect */}
      <div className="absolute inset-0 scan-lines opacity-30" />

      {/* Main Content */}
      <div className="text-center max-w-md px-6 relative z-10">
        {/* Circular Progress Ring with Holographic Scanner */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          {/* Outer Rotating Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-cyan-500/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="rgba(6, 182, 212, 0.1)"
              strokeWidth="8"
            />
            <motion.circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress / 100 }}
              transition={{ duration: 0.3 }}
              style={{
                strokeDasharray: "753.98",
                strokeDashoffset: 753.98 * (1 - progress / 100),
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>

          {/* Holographic Scanner */}
          <motion.div
            className="absolute inset-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm"
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, rgba(6, 182, 212, 0.5) 30deg, transparent 60deg)',
              }}
            />
          </motion.div>

          {/* Center Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div>
              {/* Stage Icon */}
              <motion.div
                className="text-6xl mb-2"
                key={currentStage}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {stages[currentStage].icon}
              </motion.div>
              
              {/* Progress Percentage */}
              <motion.div
                className="text-4xl font-bold gradient-text-cyber"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {Math.round(progress)}%
              </motion.div>
            </div>
          </div>

          {/* Orbiting Particles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full glow-sm"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: '-6px',
                marginTop: '-6px',
              }}
              animate={{
                x: Math.cos((i / 3) * Math.PI * 2) * 130,
                y: Math.sin((i / 3) * Math.PI * 2) * 130,
                rotate: 360,
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Stage Name */}
        <motion.h2
          className="text-3xl font-bold text-white mb-4"
          key={currentStage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {stages[currentStage].name}
        </motion.h2>

        {/* Animated Dots */}
        <motion.div className="flex justify-center gap-2 mb-8">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-cyan-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>

        {/* Data Stream Effect */}
        <div className="glass-holographic rounded-xl p-4 max-w-sm mx-auto overflow-hidden">
          <div className="space-y-1 text-left font-mono text-xs">
            {[
              '> Analyzing image structure...',
              '> Checking compression artifacts...',
              '> Detecting manipulation patterns...',
              '> Validating metadata integrity...',
            ].map((text, i) => (
              <motion.div
                key={i}
                className="text-cyan-400/70"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: [0.3, 0.7, 0.3], x: 0 }}
                transition={{
                  opacity: { duration: 2, repeat: Infinity, delay: i * 0.3 },
                  x: { duration: 0.5, delay: i * 0.1 },
                }}
              >
                {text}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Status Message */}
        <motion.p
          className="text-lg text-gray-400 mt-6"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          This will take just a few seconds
        </motion.p>
      </div>

      {/* Corner Decorations */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-20 h-20 border-2 border-cyan-400/30"
          style={{
            top: i < 2 ? '20px' : 'auto',
            bottom: i >= 2 ? '20px' : 'auto',
            left: i % 2 === 0 ? '20px' : 'auto',
            right: i % 2 === 1 ? '20px' : 'auto',
            borderTop: i < 2 ? '2px solid' : 'none',
            borderBottom: i >= 2 ? '2px solid' : 'none',
            borderLeft: i % 2 === 0 ? '2px solid' : 'none',
            borderRight: i % 2 === 1 ? '2px solid' : 'none',
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </motion.div>
  );
}
