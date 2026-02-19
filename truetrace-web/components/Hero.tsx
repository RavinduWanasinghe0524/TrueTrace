'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [typedText, setTypedText] = useState('');
  const fullText = 'Is Your Photo or Document Real or Edited?';

  // 3D Parallax effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-300, 300], [10, -10]);
  const rotateY = useTransform(x, [-300, 300], [-10, 10]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      setMouseX(e.clientX - centerX);
      setMouseY(e.clientY - centerY);
      x.set(e.clientX - centerX);
      y.set(e.clientY - centerY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [x, y]);

  // Typing animation
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        
        {/* Floating Geometric Shapes */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`shape-${i}`}
            className="absolute border border-cyan-400/20"
            style={{
              left: `${20 + i * 20}%`,
              top: `${30 + (i % 2) * 40}%`,
              width: `${40 + i * 10}px`,
              height: `${40 + i * 10}px`,
            }}
            animate={{
              rotate: [0, 360],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Scan Lines Effect */}
      <div className="absolute inset-0 scan-lines pointer-events-none opacity-30" />

      <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="transform-3d"
        >
          {/* Holographic Logo */}
          <motion.div 
            className="mb-8"
            style={{ rotateX, rotateY }}
          >
            <motion.h1 
              className="text-7xl md:text-8xl font-bold gradient-text-cyber mb-4 relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="relative inline-block">
                TrueTrace
                {/* Holographic shimmer effect */}
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{
                    x: ['-200%', '200%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                />
              </span>
            </motion.h1>
            <motion.p 
              className="text-sm text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              by <span className="gradient-text">IronLogix</span>
            </motion.p>
          </motion.div>

          {/* Typing Animation - Main Question */}
          <motion.h2 
            className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight min-h-[8rem] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {typedText}
            <motion.span
              className="inline-block w-1 h-12 md:h-16 bg-cyan-400 ml-2"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          </motion.h2>

          {/* Simple Explanation with Stagger */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            <p className="text-2xl md:text-3xl text-gray-300 mb-6">
              Upload any photo or document and we&apos;ll detect if it&apos;s been manipulated
            </p>
            
            <div className="flex items-center justify-center gap-4 text-lg text-gray-400 mb-12">
              <motion.span
                className="flex items-center gap-2"
                whileHover={{ scale: 1.1, color: '#06b6d4' }}
              >
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Free
              </motion.span>
              <span className="text-gray-600">•</span>
              <motion.span
                className="flex items-center gap-2"
                whileHover={{ scale: 1.1, color: '#06b6d4' }}
              >
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                Fast
              </motion.span>
              <span className="text-gray-600">•</span>
              <motion.span
                className="flex items-center gap-2"
                whileHover={{ scale: 1.1, color: '#06b6d4' }}
              >
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                No signup required
              </motion.span>
            </div>
          </motion.div>

          {/* Enhanced Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ 
              opacity: { delay: 2 },
              y: { duration: 2, repeat: Infinity }
            }}
            className="text-gray-400 flex flex-col items-center gap-2"
          >
            <span className="text-sm">Upload your photo or document below</span>
            <motion.svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              animate={{ 
                y: [0, 5, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </motion.svg>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Data Nodes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`node-${i}`}
            className="absolute w-3 h-3 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 glow-sm"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.sin(i) * 30, 0],
              scale: [1, 1.5, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}
