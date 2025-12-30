'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

interface DebugVisualizationProps {
  elaImage: string;
  noiseMap: string;
}

export default function DebugVisualization({ elaImage, noiseMap }: DebugVisualizationProps) {
  const [activeTab, setActiveTab] = useState<'ela' | 'noise'>('ela');

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <h2 className="text-3xl font-bold mb-6 gradient-text text-center">
          Debug Visualization
        </h2>

        <div className="glass rounded-3xl p-8">
          {/* Tab Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('ela')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'ela'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                  : 'glass hover:glass-strong'
              }`}
            >
              Error Level Analysis (ELA)
            </button>
            <button
              onClick={() => setActiveTab('noise')}
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === 'noise'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                  : 'glass hover:glass-strong'
              }`}
            >
              Noise Variance Map
            </button>
          </div>

          {/* Image Display */}
          <div className="relative aspect-video rounded-2xl overflow-hidden glass-strong">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full"
            >
              <Image
                src={activeTab === 'ela' ? elaImage : noiseMap}
                alt={activeTab === 'ela' ? 'ELA Analysis' : 'Noise Variance Map'}
                fill
                className="object-contain"
              />
            </motion.div>
          </div>

          {/* Explanation */}
          <div className="mt-6 glass rounded-xl p-6">
            <h3 className="font-bold text-lg mb-3 text-blue-400">
              {activeTab === 'ela' ? '📊 What is ELA?' : '🔍 What is Noise Variance?'}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {activeTab === 'ela'
                ? 'Error Level Analysis (ELA) identifies areas of an image that may have been modified by analyzing compression levels. Bright areas in the ELA image indicate regions that have different compression characteristics from the rest of the image, suggesting potential manipulation.'
                : 'Noise Variance Detection analyzes the consistency of noise patterns across an image. Edited or spliced regions often have different noise characteristics than the original image. Areas with significantly different noise levels appear distinct in this visualization, indicating potential tampering.'}
            </p>
          </div>

          {/* Download Button */}
          <div className="mt-6 flex gap-4">
            <a
              href={elaImage}
              download="ela-analysis.jpg"
              className="flex-1 px-6 py-3 glass rounded-xl hover:glass-strong transition-all duration-300 text-center font-medium"
            >
              Download ELA Image
            </a>
            <a
              href={noiseMap}
              download="noise-map.jpg"
              className="flex-1 px-6 py-3 glass rounded-xl hover:glass-strong transition-all duration-300 text-center font-medium"
            >
              Download Noise Map
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
