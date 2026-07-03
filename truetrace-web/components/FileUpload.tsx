'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import Image from 'next/image';

interface FileUploadProps {
  onAnalyze: (file: File) => void;
  isAnalyzing: boolean;
}

/* ──────────────────────────────────────────
   File type icon SVGs
────────────────────────────────────────── */
const FileTypeIcon = ({ type, active }: { type: string; active: boolean }) => (
  <motion.div
    animate={{ scale: active ? 1.2 : 1, opacity: active ? 1 : 0.4 }}
    transition={{ type: 'spring', stiffness: 300 }}
    className="flex flex-col items-center gap-1"
  >
    <div
      className="w-10 h-12 flex items-center justify-center rounded-lg border text-xs font-bold"
      style={{
        borderColor: active ? '#06b6d4' : 'rgba(255,255,255,0.1)',
        background: active ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.03)',
        color: active ? '#06b6d4' : '#475569',
        fontFamily: 'var(--font-heading), sans-serif',
      }}
    >
      {type}
    </div>
  </motion.div>
);

/* ──────────────────────────────────────────
   Animated dashed border SVG
────────────────────────────────────────── */
function DashedBorder({ active }: { active: boolean }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ borderRadius: 28 }}
    >
      <rect
        x="2" y="2"
        width="calc(100% - 4px)" height="calc(100% - 4px)"
        rx="26" ry="26"
        fill="none"
        stroke={active ? '#06b6d4' : 'rgba(255,255,255,0.15)'}
        strokeWidth="2"
        strokeDasharray="12 8"
        strokeLinecap="round"
        style={{
          transition: 'stroke 0.3s ease',
          animation: active ? 'dash-rotate 12s linear infinite' : 'none',
        }}
      />
      <style>{`
        @keyframes dash-rotate {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -100; }
        }
      `}</style>
    </svg>
  );
}

/* ──────────────────────────────────────────
   Upload Icon SVG
────────────────────────────────────────── */
function UploadIcon({ isDragging }: { isDragging: boolean }) {
  return (
    <motion.div
      animate={{ y: isDragging ? -8 : [0, -8, 0] }}
      transition={isDragging ? {} : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      className="relative w-20 h-20 mx-auto mb-6"
    >
      {/* Glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ scale: isDragging ? [1, 1.2, 1] : 1, opacity: isDragging ? [0.4, 0.8, 0.4] : 0.3 }}
        transition={{ duration: 1, repeat: Infinity }}
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.3), transparent)' }}
      />
      <svg className="w-full h-full relative z-10" viewBox="0 0 80 80" fill="none">
        {/* Outer hexagon-ish shape */}
        <circle cx="40" cy="40" r="36" stroke="rgba(6,182,212,0.2)" strokeWidth="1" strokeDasharray="4 4" />
        {/* Upload arrow */}
        <path
          d="M40 52V28M40 28l-10 10M40 28l10 10"
          stroke="#06b6d4"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Bottom line */}
        <path
          d="M26 56h28"
          stroke={isDragging ? '#10b981' : '#06b6d4'}
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ transition: 'stroke 0.3s' }}
        />
      </svg>
    </motion.div>
  );
}

/* ──────────────────────────────────────────
   Particle burst
────────────────────────────────────────── */
function ParticleBurst({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const dist = 80 + Math.random() * 120;
        return (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              left: '50%', top: '50%',
              background: ['#06b6d4', '#8b5cf6', '#10b981', '#ec4899'][i % 4],
            }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * dist,
              y: Math.sin(angle) * dist,
              scale: [0, 1.5, 0],
              opacity: [1, 0.8, 0],
            }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        );
      })}
    </div>
  );
}

export default function FileUpload({ onAnalyze, isAnalyzing }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string; type: string } | null>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 30, stiffness: 200 });
  const springY = useSpring(mouseY, { damping: 30, stiffness: 200 });
  const uploadRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!uploadRef.current) return;
    const rect = uploadRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left - rect.width / 2) * 0.05);
    mouseY.set((e.clientY - rect.top - rect.height / 2) * 0.05);
  };

  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  const processFile = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File is too large. Please upload a file smaller than 10MB.');
      return;
    }
    setSelectedFile(file);
    setFileInfo({
      name: file.name.length > 28 ? file.name.slice(0, 25) + '...' : file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type.split('/')[1]?.toUpperCase() || 'FILE',
    });

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 900);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <section id="upload-section" className="relative z-10 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {!preview ? (
            /* ── UPLOAD ZONE ── */
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              ref={uploadRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className="relative"
            >
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isAnalyzing}
                aria-label="Upload photo or document for forensic analysis"
                id="file-input"
              />

              <motion.div
                style={{ x: springX, y: springY }}
                className={`relative rounded-[28px] p-12 md:p-16 overflow-hidden transition-all duration-300 ${
                  isDragging ? 'glass-cyan glow-cyan scale-[1.02]' : 'glass'
                }`}
              >
                {/* SVG dashed border */}
                <DashedBorder active={isDragging} />

                {/* Particle burst */}
                <ParticleBurst active={showParticles} />

                {/* Scan lines overlay */}
                <div className="absolute inset-0 scan-lines rounded-[28px] opacity-30 pointer-events-none" />

                {/* Inner glow when dragging */}
                <AnimatePresence>
                  {isDragging && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 rounded-[28px] pointer-events-none"
                      style={{ background: 'radial-gradient(circle at center, rgba(6,182,212,0.08), transparent 60%)' }}
                    />
                  )}
                </AnimatePresence>

                <div className="relative z-10 text-center">
                  {/* Upload icon */}
                  <UploadIcon isDragging={isDragging} />

                  {/* Headline */}
                  <motion.h3
                    className="text-2xl md:text-3xl font-bold text-white mb-3"
                    style={{ fontFamily: 'var(--font-heading), sans-serif' }}
                    animate={{ color: isDragging ? '#06b6d4' : '#ffffff' }}
                    transition={{ duration: 0.3 }}
                  >
                    {isDragging ? 'Drop it right here!' : 'Drop your photo or click to upload'}
                  </motion.h3>

                  <p className="text-slate-400 mb-6 text-base">
                    {isDragging
                      ? 'Release to begin forensic analysis'
                      : 'We\'ll run 4 forensic checks to detect any manipulation'}
                  </p>

                  {/* File type indicators */}
                  <div className="flex items-center justify-center gap-4 mb-6">
                    {['JPG', 'PNG', 'PDF', 'DOC'].map((t) => (
                      <FileTypeIcon key={t} type={t} active={isDragging} />
                    ))}
                  </div>

                  <p className="text-xs text-slate-600">
                    Supported formats: JPEG, PNG, PDF, Word · Max file size: 10 MB
                  </p>
                </div>
              </motion.div>
            </motion.div>

          ) : (
            /* ── PREVIEW PANEL ── */
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              className="space-y-4"
            >
              {/* Image preview */}
              <div className="relative aspect-video rounded-2xl overflow-hidden glass-holo">
                <Image src={preview} alt="Uploaded file preview" fill className="object-contain" />

                {/* Corner brackets */}
                {[
                  { top: 0, left: 0, borderRight: 'none', borderBottom: 'none' },
                  { top: 0, right: 0, borderLeft: 'none', borderBottom: 'none' },
                  { bottom: 0, left: 0, borderRight: 'none', borderTop: 'none' },
                  { bottom: 0, right: 0, borderLeft: 'none', borderTop: 'none' },
                ].map((style, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-6 h-6 border-2 border-cyan-400"
                    style={{ ...style, borderRadius: 0 } as React.CSSProperties}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 + i * 0.05, type: 'spring' }}
                  />
                ))}

                {/* Ready badge */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="absolute top-4 left-4 flex items-center gap-2 glass rounded-full px-3 py-1.5"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse-glow" />
                  <span className="text-xs font-semibold text-emerald-300">Ready for analysis</span>
                </motion.div>
              </div>

              {/* File info */}
              {fileInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass rounded-xl px-5 py-3 flex items-center gap-4"
                >
                  <div
                    className="flex-shrink-0 w-10 h-12 flex items-center justify-center rounded-lg text-xs font-bold border border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                    style={{ fontFamily: 'var(--font-heading), sans-serif' }}
                  >
                    {fileInfo.type}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{fileInfo.name}</p>
                    <p className="text-xs text-slate-500">{fileInfo.size}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-xs text-emerald-400 font-medium">Loaded</span>
                  </div>
                </motion.div>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  onClick={() => { setPreview(null); setSelectedFile(null); setFileInfo(null); }}
                  disabled={isAnalyzing}
                  className="btn-ghost py-4 disabled:opacity-40"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ fontFamily: 'var(--font-heading), sans-serif' }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 3v10M10 3l-3 3M10 3l3 3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 14v1a2 2 0 002 2h10a2 2 0 002-2v-1" strokeLinecap="round" />
                  </svg>
                  Choose Different
                </motion.button>

                <motion.button
                  onClick={() => { if (selectedFile && !isAnalyzing) onAnalyze(selectedFile); }}
                  disabled={isAnalyzing || !selectedFile}
                  className="btn-primary py-4 disabled:opacity-40 disabled:cursor-not-allowed"
                  whileHover={{ scale: isAnalyzing ? 1 : 1.03 }}
                  whileTap={{ scale: isAnalyzing ? 1 : 0.97 }}
                  style={{ fontFamily: 'var(--font-heading), sans-serif' }}
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="9" strokeOpacity="0.3" />
                        <path d="M12 3a9 9 0 019 9" strokeLinecap="round" />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="10" cy="10" r="7" />
                        <path d="M10 6v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Run Analysis
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
