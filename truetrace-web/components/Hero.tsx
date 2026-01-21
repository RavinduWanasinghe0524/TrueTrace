'use client';

import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState({ scanned: 0, accuracy: 0, speed: 0 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX - window.innerWidth / 2;
      const y = e.clientY - window.innerHeight / 2;
      setMousePosition({ x, y });
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Animate stats on mount
  useEffect(() => {
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setStats({
        scanned: Math.floor(progress * 10000),
        accuracy: Math.floor(progress * 99),
        speed: Math.floor(progress * 95),
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, []);

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Mouse-following gradient spotlight */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.5) 0%, rgba(16,185,129,0.4) 50%, transparent 70%)',
          left: mousePosition.x - 300,
          top: mousePosition.y - 300,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 30 }}
      />

      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow" style={{ animationDelay: '1.3s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow" style={{ animationDelay: '2.6s' }}></div>
      </div>

      <div className="container mx-auto px-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center"
        >
          {/* Company Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6"
          >
            <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-300">Powered by IronLogix</span>
          </motion.div>

          {/* Main Heading with 3D effect */}
          <motion.div
            style={{ rotateX, rotateY, transformPerspective: 1000 }}
            className="mb-6"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="text-6xl md:text-8xl font-bold"
            >
              <span className="gradient-text">TrueTrace</span>
            </motion.h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            AI-Powered Document Forgery Detection System
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="text-md text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            Upload any image to detect signs of manipulation using four powerful detection methods: 
            AI Forensics, Metadata Analysis, Error Level Analysis (ELA), and Noise Variance Detection.
          </motion.p>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {['AI Forensics', 'Metadata Analysis', 'ELA Detection', 'Noise Variance'].map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1, ease: [0.4, 0, 0.2, 1] }}
                className="glass px-6 py-3 rounded-full hover:glass-strong transition-all duration-300 cursor-default group"
                whileHover={{ scale: 1.08, y: -3 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full group-hover:scale-125 transition-transform"></div>
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Animated Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="grid grid-cols-3 gap-6 max-w-2xl mx-auto"
          >
            {[
              { label: 'Images Scanned', value: stats.scanned.toLocaleString(), suffix: '+' },
              { label: 'Accuracy Rate', value: stats.accuracy, suffix: '%' },
              { label: 'Speed Score', value: stats.speed, suffix: '/100' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1, ease: [0.4, 0, 0.2, 1] }}
                className="glass rounded-2xl p-4 hover:glass-strong transition-all duration-300"
                whileHover={{ scale: 1.08, y: -3 }}
              >
                <motion.div
                  className="text-3xl md:text-4xl font-bold gradient-text mb-1"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.5, type: 'spring', bounce: 0.4 }}
                >
                  {stat.value}{stat.suffix}
                </motion.div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="mt-16"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex flex-col items-center gap-2 text-gray-400 text-sm"
            >
              <span>Scroll to upload</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
