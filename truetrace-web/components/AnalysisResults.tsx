'use client';

import { motion } from 'framer-motion';
import { AnalysisResult } from '@/lib/types';
import { useState, useEffect } from 'react';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    // Trigger particle explosion on mount
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 2000);
  }, []);

  // Determine simple verdict
  const getVerdict = () => {
    if (result.finalScore >= 70) {
      return {
        emoji: '✅',
        title: 'YOUR PHOTO IS REAL',
        message: 'We didn\'t find signs of editing',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        glowColor: 'glow-green'
      };
    } else if (result.finalScore >= 40) {
      return {
        emoji: '⚠️',
        title: 'YOUR PHOTO MIGHT BE EDITED',
        message: 'We found some unusual things',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        glowColor: 'glow-yellow'
      };
    } else {
      return {
        emoji: '❌',
        title: 'YOUR PHOTO WAS EDITED',
        message: 'We found clear signs of editing',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        glowColor: 'glow-red'
      };
    }
  };

  const verdict = getVerdict();

  return (
    <div className="container mx-auto px-4 py-12 relative">
      {/* Particle Explosion Effect */}
      {showParticles && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                background: `linear-gradient(135deg, ${
                  i % 3 === 0 ? '#06b6d4' : i % 3 === 1 ? '#8b5cf6' : '#10b981'
                })`,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                x: Math.cos((i / 40) * Math.PI * 2) * (200 + Math.random() * 200),
                y: Math.sin((i / 40) * Math.PI * 2) * (200 + Math.random() * 200),
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ 
          duration: 0.8,
          type: "spring",
          stiffness: 100
        }}
        className="max-w-3xl mx-auto"
      >
        {/* MAIN RESULT - HOLOGRAPHIC CARD */}
        <motion.div 
          className={`glass-holographic rounded-3xl p-12 text-center border-2 ${verdict.borderColor} ${verdict.bgColor} relative overflow-hidden scan-lines`}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {/* Animated Background Glow */}
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{
              background: [
                'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          />

          {/* Giant Emoji with Animation */}
          <motion.div 
            className="text-9xl mb-6 relative z-10"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: 0.3,
              type: "spring",
              stiffness: 200
            }}
          >
            <motion.span
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              {verdict.emoji}
            </motion.span>
          </motion.div>

          {/* Giant Verdict with Glitch Effect */}
          <motion.h2 
            className={`text-5xl md:text-6xl font-bold mb-6 ${verdict.color} relative z-10`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.span
              animate={{
                textShadow: [
                  `0 0 20px ${verdict.color.includes('green') ? 'rgba(16, 185, 129, 0.5)' : verdict.color.includes('yellow') ? 'rgba(234, 179, 8, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
                  `0 0 40px ${verdict.color.includes('green') ? 'rgba(16, 185, 129, 0.8)' : verdict.color.includes('yellow') ? 'rgba(234, 179, 8, 0.8)' : 'rgba(239, 68, 68, 0.8)'}`,
                  `0 0 20px ${verdict.color.includes('green') ? 'rgba(16, 185, 129, 0.5)' : verdict.color.includes('yellow') ? 'rgba(234, 179, 8, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {verdict.title}
            </motion.span>
          </motion.h2>

          {/* Simple Message */}
          <motion.p 
            className="text-2xl md:text-3xl text-white mb-8 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {verdict.message}
          </motion.p>

          {/* Animated Confidence Score */}
          <motion.div 
            className="inline-block px-8 py-4 glass-holographic rounded-2xl relative z-10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
          >
            <p className="text-gray-400 text-sm mb-1">Confidence Level</p>
            
            {/* Animated Number Counter */}
            <motion.p 
              className="text-4xl font-bold gradient-text-cyber mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                {result.finalScore}%
              </motion.span>
            </motion.p>
            
            {/* Progress Bar */}
            <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden mb-2">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${result.finalScore}%` }}
                transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
              />
            </div>
            
            <p className="text-xs text-gray-500">
              {result.finalScore >= 70 ? 'High confidence' : result.finalScore >= 40 ? 'Medium confidence' : 'Low confidence'}
            </p>
          </motion.div>

          {/* Floating Particles Around Card */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-cyan-400/40 rounded-full"
                style={{
                  left: `${20 + i * 15}%`,
                  top: `${30 + (i % 2) * 40}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.6, 0.2],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Optional Details - Collapsed by Default */}
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <motion.button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-6 py-4 glass-holographic rounded-xl hover:bg-white/10 transition-all text-lg magnetic-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: showDetails ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ▼
              </motion.span>
              {showDetails ? 'Hide Technical Details' : 'Show Technical Details'}
            </span>
          </motion.button>

          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 glass-holographic rounded-xl p-6 overflow-hidden"
            >
              <h3 className="text-xl font-bold mb-4 text-white gradient-text-cyber">
                We ran {result.results.length} checks on your photo:
              </h3>
              
              <div className="space-y-3">
                {result.results.map((check, index) => {
                  const icon = check.result === 'Pass' ? '✅' : check.result === 'Fail' ? '❌' : '⚠️';
                  const statusText = check.result === 'Pass' ? 'Looks good' : check.result === 'Fail' ? 'Found issues' : 'Uncertain';
                  
                  return (
                    <motion.div 
                      key={index} 
                      className="flex items-start gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      <motion.span 
                        className="text-2xl"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                      >
                        {icon}
                      </motion.span>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{check.detector}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-400">{statusText}</p>
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${
                                check.result === 'Pass' 
                                  ? 'bg-green-500' 
                                  : check.result === 'Fail' 
                                  ? 'bg-red-500' 
                                  : 'bg-yellow-500'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${check.score}%` }}
                              transition={{ delay: 0.2 + index * 0.1, duration: 0.8 }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 min-w-[3rem] text-right">{check.score}%</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
