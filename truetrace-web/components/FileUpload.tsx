'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Image from 'next/image';

interface FileUploadProps {
  onAnalyze: (file: File) => void;
  isAnalyzing: boolean;
}

export default function FileUpload({ onAnalyze, isAnalyzing }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  
  const uploadRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 200 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!uploadRef.current) return;
    const rect = uploadRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set((e.clientX - centerX) * 0.1);
    mouseY.set((e.clientY - centerY) * 0.1);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Trigger particle burst
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 1000);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('⚠️ File is too large!\n\nPlease upload a file smaller than 10MB.');
        return;
      }
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('⚠️ File is too large!\n\nPlease upload a file smaller than 10MB.');
        return;
      }
      handleFileSelect(file);
    }
  };

  const handleAnalyze = () => {
    if (selectedFile && !isAnalyzing) {
      onAnalyze(selectedFile);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        {!preview ? (
          /* FUTURISTIC UPLOAD AREA */
          <motion.div 
            ref={uploadRef}
            className="relative"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isAnalyzing}
              aria-label="Upload photo or document for analysis"
            />
            
            <motion.div 
              className={`glass-holographic rounded-3xl p-16 border-2 transition-all duration-300 cursor-pointer relative overflow-hidden ${
                isDragging ? 'border-cyan-400 scale-105 glow-neon' : 'border-white/30'
              }`}
              style={{ x, y }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Particle Burst Effect */}
              {showParticles && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                      style={{
                        left: '50%',
                        top: '50%',
                      }}
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{
                        x: Math.cos((i / 20) * Math.PI * 2) * 200,
                        y: Math.sin((i / 20) * Math.PI * 2) * 200,
                        scale: [0, 1, 0],
                        opacity: [1, 1, 0],
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  ))}
                </div>
              )}

              {/* Scan Lines */}
              <div className="absolute inset-0 scan-lines opacity-20 rounded-3xl" />
              
              <div className="text-center relative z-10">
                {/* Animated Upload Icon */}
                <motion.div 
                  className="text-8xl mb-6 inline-block"
                  animate={{ 
                    y: [0, -10, 0],
                    rotateZ: isDragging ? [0, -5, 5, 0] : 0
                  }}
                  transition={{ 
                    y: { duration: 2, repeat: Infinity },
                    rotateZ: { duration: 0.5 }
                  }}
                >
                  📤
                </motion.div>
                
                {/* Glowing Text */}
                <motion.h3 
                  className="text-4xl font-bold text-white mb-4"
                  animate={{ 
                    textShadow: isDragging 
                      ? '0 0 20px rgba(6, 182, 212, 0.8)' 
                      : '0 0 0px rgba(6, 182, 212, 0)'
                  }}
                >
                  {isDragging ? 'Drop It Here!' : 'Click to Upload Your Photo or Document'}
                </motion.h3>
                
                <p className="text-xl text-gray-400 mb-2">
                  {isDragging ? 'Release to analyze' : 'Choose any photo or document from your computer'}
                </p>
                
                <motion.p 
                  className="text-sm text-gray-500 mt-3"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  JPEG, PNG, PDF, or Word Document • Max 10MB
                </motion.p>

                {/* Floating Indicators */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                      style={{
                        left: `${25 + i * 16.66}%`,
                        top: '50%',
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* PREVIEW & BUTTONS - ENHANCED */
          <div className="space-y-6">
            {/* Photo Preview with Holographic Frame */}
            <motion.div 
              className="relative aspect-video rounded-2xl overflow-hidden bg-black/50 glass-holographic"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Image
                src={preview}
                alt="Your photo"
                fill
                className="object-contain"
              />
              
              {/* Corner Accents */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-8 h-8 border-2 border-cyan-400"
                  style={{
                    top: i < 2 ? 0 : 'auto',
                    bottom: i >= 2 ? 0 : 'auto',
                    left: i % 2 === 0 ? 0 : 'auto',
                    right: i % 2 === 1 ? 0 : 'auto',
                    borderTop: i < 2 ? '2px solid' : 'none',
                    borderBottom: i >= 2 ? '2px solid' : 'none',
                    borderLeft: i % 2 === 0 ? '2px solid' : 'none',
                    borderRight: i % 2 === 1 ? '2px solid' : 'none',
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                />
              ))}
            </motion.div>

            {/* Enhanced Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                onClick={() => {
                  setPreview(null);
                  setSelectedFile(null);
                }}
                disabled={isAnalyzing}
                className="py-4 px-6 text-xl glass-holographic rounded-xl hover:bg-white/10 transition-all disabled:opacity-50 magnetic-btn relative overflow-hidden group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Choose Different Photo</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
              </motion.button>

              <motion.button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="py-4 px-6 text-xl bg-gradient-to-r from-cyan-600 to-emerald-600 rounded-xl hover:from-cyan-500 hover:to-emerald-500 transition-all font-bold disabled:opacity-50 relative overflow-hidden glow-neon"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span 
                  className="relative z-10"
                  animate={{ 
                    textShadow: ['0 0 10px rgba(255,255,255,0.5)', '0 0 20px rgba(255,255,255,0.8)', '0 0 10px rgba(255,255,255,0.5)']
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {isAnalyzing ? 'Checking...' : 'Check It'}
                </motion.span>
                
                {/* Animated Background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                />
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
