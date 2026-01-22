'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';

interface DebugVisualizationProps {
  elaImage: string;
  noiseMap: string;
  originalImage?: string;
}

export default function DebugVisualization({ elaImage, noiseMap, originalImage }: DebugVisualizationProps) {
  const [activeTab, setActiveTab] = useState<'ela' | 'noise' | 'compare'>('ela');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 1));

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* SIMPLIFIED TITLE */}
        <h2 className="text-3xl font-bold mb-6 gradient-text text-center">
          See What We Found
        </h2>

        <div className="glass rounded-3xl p-8">
          {/* Tab Buttons - SIMPLIFIED */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <button
              onClick={() => setActiveTab('ela')}
              className={`flex-1 min-w-[150px] px-6 py-3 rounded-xl font-semibold transition-all duration-300 magnetic-btn ${
                activeTab === 'ela'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 glow-sm'
                  : 'glass hover:glass-strong'
              }`}
            >
              🔍 Editing Highlights
            </button>
            <button
              onClick={() => setActiveTab('noise')}
              className={`flex-1 min-w-[150px] px-6 py-3 rounded-xl font-semibold transition-all duration-300 magnetic-btn ${
                activeTab === 'noise'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 glow-sm'
                  : 'glass hover:glass-strong'
              }`}
            >
              📊 Pattern Map
            </button>
            {originalImage && (
              <button
                onClick={() => setActiveTab('compare')}
                className={`flex-1 min-w-[150px] px-6 py-3 rounded-xl font-semibold transition-all duration-300 magnetic-btn ${
                  activeTab === 'compare'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 glow-sm'
                    : 'glass hover:glass-strong'
                }`}
              >
                🔄 Compare
              </button>
            )}
          </div>

          {/* Image Display */}
          {activeTab === 'compare' && originalImage ? (
            <BeforeAfterSlider
              beforeImage={originalImage}
              afterImage={elaImage}
              beforeLabel="Original"
              afterLabel="With Highlights"
            />
          ) : (
            <div className={`relative aspect-video rounded-2xl overflow-hidden glass-strong ${isFullscreen ? 'fixed inset-4 z-50 aspect-auto' : ''}`}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
              >
                <Image
                  src={activeTab === 'ela' ? elaImage : noiseMap}
                  alt={activeTab === 'ela' ? 'Editing Highlights' : 'Pattern Map'}
                  fill
                  className="object-contain"
                />
              </motion.div>

              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                <motion.button
                  onClick={handleZoomOut}
                  disabled={zoom <= 1}
                  className="w-10 h-10 glass rounded-lg flex items-center justify-center hover:glass-strong disabled:opacity-50 transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </motion.button>
                <motion.button
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="w-10 h-10 glass rounded-lg flex items-center justify-center hover:glass-strong disabled:opacity-50 transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </motion.button>
                <motion.button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="w-10 h-10 glass rounded-lg flex items-center justify-center hover:glass-strong transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isFullscreen ? "M9 9V4.5M9 9H4.5M9 9L3 3m6 15v4.5M9 21h4.5M9 21l6 6m6-15v-4.5M21 9h-4.5M21 9l-6-6m0 15v4.5m0-4.5h4.5m0 0l6 6" : "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"} />
                  </svg>
                </motion.button>
              </div>

              {zoom > 1 && (
                <div className="absolute bottom-4 left-4 px-3 py-1 glass rounded-lg text-sm">
                  Zoom: {Math.round(zoom * 100)}%
                </div>
              )}
            </div>
          )}

          {/* Explanation - SIMPLIFIED */}
          <div className="mt-6 glass rounded-xl p-6">
            <h3 className="font-bold text-lg mb-3 text-blue-400">
              {activeTab === 'ela' ? '🔍 What are Editing Highlights?' : activeTab === 'noise' ? '📊 What is the Pattern Map?' : '🔄 Interactive Comparison'}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {activeTab === 'ela'
                ? 'Bright or colorful areas show parts of the image that might have been edited. When someone edits a photo, those edited parts often have different quality than the rest. This tool highlights those differences.'
                : activeTab === 'noise'
                ? 'Every photo has tiny random dots (called "noise"). Real photos have consistent noise patterns. If someone edits a photo by copying and pasting, the noise patterns won\'t match. Different colors in this map show areas with different noise patterns.'
                : 'Use the slider to compare your original photo with our analysis. Drag left or right to see the differences and spot any edited areas.'}
            </p>
          </div>

          {/* Download Buttons - SIMPLIFIED */}
          <div className="mt-6 flex gap-4 flex-wrap">
            <a
              href={elaImage}
              download="editing-highlights.jpg"
              className="flex-1 min-w-[200px] px-6 py-3 glass rounded-xl hover:glass-strong transition-all duration-300 text-center font-medium magnetic-btn"
            >
              📥 Save Editing Highlights
            </a>
            <a
              href={noiseMap}
              download="pattern-map.jpg"
              className="flex-1 min-w-[200px] px-6 py-3 glass rounded-xl hover:glass-strong transition-all duration-300 text-center font-medium magnetic-btn"
            >
              📥 Save Pattern Map
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
